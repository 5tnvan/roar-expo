// PipecatContext.tsx
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule } from "@/types/types";
import { PipecatClient, Transport, TransportState } from "@pipecat-ai/client-js";
import { RNDailyTransport } from "@pipecat-ai/react-native-daily-transport";
import { Audio } from "expo-av";
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";

interface TranscriptionEntry {
    type: "user" | "bot";
    text: string;
    timestamp: string;
}

interface PipecatContextProps {
    inCall: boolean;
    isLoading: boolean;
    audioLevel: number;
    remoteAudioLevel: number;
    currentState: TransportState;
    start: () => Promise<void>;
    leave: () => Promise<void>;
    sendCapsule: (capsule : Capsule) => void; //send it to pipecat and tranfer to
    baseUrl: string;
    setBaseUrl: (url: string) => void;
    transcriptionLog: TranscriptionEntry[];
    openCapsule: {
        queue: boolean;
        capsule: Capsule;
    } | null;
    setOpenCapsule: React.Dispatch<
        React.SetStateAction<{
            queue: boolean;
            capsule: Capsule;
        } | null>
    >;
}

export const PipecatContext = createContext<PipecatContextProps | undefined>(undefined);

interface PipecatProviderProps {
    children: ReactNode;
}

export const PipecatProvider: React.FC<PipecatProviderProps> = ({ children }) => {
    const { profile } = useAuth();
    const [baseUrl, setBaseUrl] = useState("http://192.168.0.184:7860");
    const [pipecatClient, setPipecatClient] = useState<PipecatClient>();
    const [inCall, setInCall] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentState, setCurrentState] = useState<TransportState>("disconnected");
    const [audioLevel, setAudioLevel] = useState(0);
    const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);
    const [transcriptionLog, setTranscriptionLog] = useState<TranscriptionEntry[]>([]);
    const [openCapsule, setOpenCapsule] = useState<{
        queue: boolean;
        capsule: Capsule
    } | null>(null);
    const botSpeakingRef = useRef(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    // Log transcript
    const logTranscript = (type: "user" | "bot", text: string) => {
        const timestamp = new Date().toISOString();
        const trimmedText = text.replace(/\n/g, ' ').trim();
        setTranscriptionLog((prev) => [...prev, { type, text: trimmedText, timestamp }]);
        console.log(`${type} transcript:`, trimmedText);
    };

    // Create Pipecat client
    const createClient = useCallback(() => {
        return new PipecatClient({
            transport: new RNDailyTransport() as Transport,
            enableMic: true,
            enableCam: false,
            callbacks: {
                onConnected: () => setInCall(true),
                onDisconnected: () => setInCall(false),
                onTransportStateChanged: (state) => setCurrentState(state),
                onError: (err) => console.log("Pipecat error:", err),
                onUserStartedSpeaking: () => {
                    botSpeakingRef.current = false;
                    setAudioLevel(1);
                },
                onUserStoppedSpeaking: () => {
                    botSpeakingRef.current = false;
                    setAudioLevel(0);
                },
                onBotStartedSpeaking: () => {
                    botSpeakingRef.current = true;
                    setRemoteAudioLevel(1);
                },
                onBotStoppedSpeaking: () => {
                    botSpeakingRef.current = false;
                    setRemoteAudioLevel(0);
                },
                onUserTranscript(data) {
                    if (data.final) logTranscript("user", data.text);
                },
                onBotTranscript(data) {
                    if (data?.text) logTranscript("bot", data.text);
                },
            },
        });
    }, []);

    // Start Pipecat
    const start = useCallback(async () => {
        try {
            setIsLoading(true); // start loading
            const client = createClient();
            setPipecatClient(client);
            await client.startBotAndConnect({
                endpoint: `${baseUrl}/api/start`, 
                requestData: {
                    preferred_language: profile?.language || ''  // Spanish
                }
            });
        } catch (e) {
            console.log("Failed to start Pipecat", e);
        } finally {
            setIsLoading(false);
        }
    }, [baseUrl, createClient, profile?.language]);

    // Leave Pipecat
    const leave = useCallback(async () => {
        if (!pipecatClient) return;
        try {
            await pipecatClient.disconnect();
            setPipecatClient(undefined);
            setAudioLevel(0);
            setRemoteAudioLevel(0);
            setOpenCapsule(null);
        } catch (e) {
            console.log("Failed to disconnect Pipecat", e);
        }
    }, [pipecatClient]);

    // Send capsule
    const sendCapsule = useCallback(
        async (capsule: Capsule) => {
            if (!pipecatClient) {
                console.log("Not connected, starting Pipecat...");
                await start();
                setOpenCapsule({ queue: false, capsule });
            } else {
                try {
                    pipecatClient?.sendClientMessage(
                        JSON.stringify({
                            type: "mib",
                            data: {
                                author: capsule.owner.full_name,
                                message: capsule.content + (capsule.pdf_content || "")
                            }
                        })
                    );
                    setOpenCapsule({ queue: true, capsule });
                    console.log("Capsule message sent");
                } catch (e: any) {
                    console.log(`Failed to send capsule: ${e.message}`);
                }
            }

        },
        [pipecatClient, start]
    );


    // Play / stop ringing sound based on isLoading
    useEffect(() => {
        const playRinging = async () => {
            if (!soundRef.current) {
                const { sound } = await Audio.Sound.createAsync(
                    require("../../assets/mp3/phone-ringing-382734.mp3"),
                    { isLooping: true }
                );
                soundRef.current = sound;
                await sound.playAsync();
            } else {
                await soundRef.current.replayAsync();
            }
        };

        const stopRinging = async () => {
            if (soundRef.current) {
                await soundRef.current.stopAsync();
            }
        };

        if (isLoading) {
            playRinging();
        } else {
            stopRinging();
        }

        return () => {
            stopRinging();
        };
    }, [isLoading]);

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    // Cleanup listeners
    useEffect(() => {
        return () => {
            if (pipecatClient) pipecatClient.removeAllListeners();
        };
    }, [pipecatClient]);

    return (
        <PipecatContext.Provider
            value={{
                inCall,
                isLoading,
                audioLevel,
                remoteAudioLevel,
                currentState,
                start,
                leave,
                sendCapsule,
                baseUrl,
                setBaseUrl,
                transcriptionLog,
                openCapsule,
                setOpenCapsule,
            }}
        >
            {children}
        </PipecatContext.Provider>
    );
};

export const usePipecat = () => {
    const context = useContext(PipecatContext);
    if (!context) throw new Error("usePipecat must be used within PipecatProvider");
    return context;
};
