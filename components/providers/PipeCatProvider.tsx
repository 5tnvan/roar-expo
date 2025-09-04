// PipecatContext.tsx
import { useAuth } from "@/services/providers/AuthProvider";
import { Capsule, Profile, TranscriptionEntry } from "@/types/types";
import { PipecatClient, Transport, TransportState } from "@pipecat-ai/client-js";
import { RNDailyTransport } from "@pipecat-ai/react-native-daily-transport";
import { Audio } from "expo-av";
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

interface PipecatContextProps {
    inCall: boolean;
    isLoading: boolean;
    audioLevel: number;
    remoteAudioLevel: number;
    currentState: TransportState;
    start: () => Promise<void>;
    leave: () => Promise<void>;
    baseUrl: string;
    setBaseUrl: (url: string) => void;
    transcriptionLog: TranscriptionEntry[];
    sendCapsule: (capsule : Capsule) => void;
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
    sendConvoSession: (callee_profile: Profile, convo_session_id: string) => void;
    openConvoSession: {
        queue: boolean;
        callee_profile: Profile;
        convo_session_id: string
    } | null;
    setOpenConvoSession: React.Dispatch<
        React.SetStateAction<{
            queue: boolean;
            callee_profile: Profile;
            convo_session_id: string
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
    const [openConvoSession, setOpenConvoSession] = useState<{
        queue: boolean;
        callee_profile: Profile;
        convo_session_id: string;
    } | null>(null);
    const botSpeakingRef = useRef(false);
    const router = useRouter();

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
        if (profile?.gemini_api_key === "" || !profile?.gemini_api_key) {
  Alert.alert(
    "Gemini API Key Missing",
    "Please set your Gemini API key in the Bot settings.",
    [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Go to Settings",
        onPress: () => router.push("/bot"), // replace with your screen name
      }
    ],
    { cancelable: true }
  );
  return;
}
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setIsLoading(true); // start loading
            const client = createClient();
            setPipecatClient(client);
            await client.startBotAndConnect({
                endpoint: `${baseUrl}/api/start`, 
                requestData: {
                    preferred_language: profile?.bot_language || 'en-US',
                    gemini_api_key: profile?.gemini_api_key || '' 
                }
            });
        } catch (e) {
            console.log("Failed to start Pipecat", e);
        } finally {
            setIsLoading(false);
        }
    }, [baseUrl, createClient, profile?.bot_language, profile?.gemini_api_key]);

    // Leave Pipecat
    const leave = useCallback(async () => {
        if (!pipecatClient) return;
        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
            await pipecatClient.disconnect();
            setPipecatClient(undefined);
            setAudioLevel(0);
            setRemoteAudioLevel(0);
            setOpenCapsule(null);
            setTranscriptionLog([]);
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

    // Send capsule
    const sendConvoSession = useCallback(
        async (callee_profile: Profile, convo_session_id: string) => {
            if (!pipecatClient) {
                console.log("Not connected, starting Pipecat...");
                await start();
                setOpenConvoSession({ queue: false, callee_profile, convo_session_id });
            } else {
                try {
                    pipecatClient?.sendClientMessage(
                        JSON.stringify({
                            type: "assist",
                            data: {
                                callee: callee_profile.full_name,
                                caller: profile?.full_name, //logged in
                            }
                        })
                    );
                    setOpenConvoSession({ queue: true, callee_profile, convo_session_id });
                    console.log("Assist message sent, callee, caller", callee_profile.full_name, profile?.full_name);
                } catch (e: any) {
                    console.log(`Failed to send capsule: ${e.message}`);
                }
            }

        },
        [pipecatClient, start]
    );


    useEffect(() => {
    let sound: Audio.Sound;

    const startRinging = async () => {
      sound = new Audio.Sound();
      await sound.loadAsync(require("../../assets/mp3/phone-ringing-382734.mp3"));
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();
    };

    const stopRinging = async () => {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }
    };

    if (isLoading) {
      startRinging();
    } else {
      stopRinging();
    }

    // Cleanup on unmount
    return () => {
      stopRinging();
    };
  }, [isLoading]);

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
                baseUrl,
                setBaseUrl,
                transcriptionLog,
                sendCapsule,
                openCapsule,
                setOpenCapsule,
                sendConvoSession,
                openConvoSession,
                setOpenConvoSession
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
