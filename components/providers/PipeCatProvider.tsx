// PipecatContext.tsx
import { supabase } from "@/lib/supabase";
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
    sendCapsule: (capsule: Capsule) => void;
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
    sendConvoSession: (callee_profile: Profile, convo_session_id: string, convo_session_reply_id:string) => void;
    openConvoSession: {
        queue: boolean;
        callee_profile: Profile;
        convo_session_id: string;
        convo_session_reply_id: string;
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
    const router = useRouter();
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
        convo_session_reply_id?: string;
    } | null>(null);
    const botSpeakingRef = useRef(false);

    const soundRef = useRef<Audio.Sound | null>(null);
    const capsuleCallStartRef = useRef<number | null>(null);
    const profileCallStartRef = useRef<number | null>(null);
    const capsuleCallHandledRef = useRef(false);
    const profileCallHandledRef = useRef(false);

    // --- Ringing helpers ---
    const startRinging = async () => {
        if (!soundRef.current) {
            const sound = new Audio.Sound();
            await sound.loadAsync(require("../../assets/mp3/phone-ringing-382734.mp3"));
            await sound.setIsLoopingAsync(true);
            await sound.playAsync();
            soundRef.current = sound;
        }
    };

    const stopRinging = async () => {
        if (soundRef.current) {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }
    };

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
    if (!profile?.gemini_api_key || profile.gemini_api_key === "") {
        Alert.alert(
            "Gemini API Key Missing",
            "Please set your Gemini API key in the Bot settings.",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Go to Settings", onPress: () => router.push("/bot") }
            ]
        );
        return;
    }

    try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        setIsLoading(true);

        const client = createClient();
        setPipecatClient(client);

        startRinging();

        await Promise.race([
            client.startBotAndConnect({
                endpoint: `${baseUrl}/api/start`,
                requestData: {
                    preferred_language: profile?.bot_language || 'en-US',
                    gemini_api_key: profile.gemini_api_key
                }
            }),
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Timeout after 10s")), 15000)
            )
        ]);

    } catch (e: any) {
        console.log("Failed to start Pipecat", e);

        if (e.message.includes("Timeout")) {
            Alert.alert(
                "Connection timeout, 15s.",
                "Check your API key or network and try again.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Go to Settings", onPress: () => router.push("/bot") }
                ]
            );
        } else {
            Alert.alert("Connection Error", "Failed to start the bot. Please try again later.");
        }
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
            //setOpenCapsule(null);
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
            } else if (openCapsule?.queue || openConvoSession?.queue) {
                Alert.alert(
                    "Already in call",
                    "Please hang up first.",
                    [
                        {
                            text: "Cancel",
                            style: "cancel"
                        },
                        {
                            text: "Go to Call",
                            onPress: () => router.push("/"), // replace with your screen name
                        }
                    ],
                    { cancelable: true }
                );
                return;
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
        async (
            callee_profile: Profile,
            convo_session_id: string,
            convo_session_reply_id: string,
        ) => {
            if (!pipecatClient) {
                console.log("Not connected, starting Pipecat...");
                await start();
                setOpenConvoSession({ queue: false, callee_profile, convo_session_id, convo_session_reply_id });
                return;
            }
            let payload;

    
            if (convo_session_reply_id.length > 0) {
                const { data, error } = await supabase
                    .from("convo_session_reply")
                    .select("*, convo_session:convo_session_id(transcript)") // prev script
                    .eq("id", convo_session_reply_id)
                    .maybeSingle(); // 👈 returns a single row or null

                if (data) {
                    payload = {
                        type: "assist_with_reply",
                        data: {
                            callee: callee_profile.full_name,
                            caller: profile?.full_name, // logged in
                            prev_session: data.convo_session?.transcript,
                            reply: data.content,//reply
                        },
                    };
                }
            } else {
                 payload = {
                    type: "assist",
                    data: {
                        callee: callee_profile.full_name,
                        caller: profile?.full_name, // logged in
                    },
                };
            }

            try {
                pipecatClient?.sendClientMessage(JSON.stringify(payload));

                setOpenConvoSession({
                    queue: true,
                    callee_profile,
                    convo_session_id,
                    convo_session_reply_id,
                });
            } catch (e: any) {
                console.log(`Failed to send capsule: ${e.message}`);
            }
        },
        [pipecatClient, start, profile]
    );



    // stop ringing
    useEffect(() => {
        if (inCall) stopRinging();
    }, [inCall]);

    // --- CAPSULE CALL ANALYTICS ---
    useEffect(() => {

        if (inCall && openCapsule && !capsuleCallStartRef.current) {
            capsuleCallStartRef.current = Date.now();
            capsuleCallHandledRef.current = false;
        }

        if (!inCall && openCapsule && capsuleCallStartRef.current && !capsuleCallHandledRef.current) {
            const handleCapsuleCallEnd = async () => {
                capsuleCallHandledRef.current = true;
                const duration = Math.floor((Date.now() - capsuleCallStartRef.current!) / 1000);

                try {
                    await supabase.from("capsule_call").insert({
                        capsule_id: openCapsule.capsule.id,
                        caller_id: profile?.id,
                        duration,
                        transcript: transcriptionLog,
                    });

                    await supabase.rpc("increment_capsule_stats_call_duration", {
                        capsule: openCapsule.capsule.id,
                        additional_duration: duration,
                    });
                } catch (e) {
                    console.error("Capsule call logging failed:", e);
                }
                capsuleCallStartRef.current = null;
                setOpenCapsule(null);
            };
            handleCapsuleCallEnd();
        }
    }, [inCall, openCapsule, transcriptionLog]);


    // --- PROFILE / CONVO SESSION CALL ANALYTICS ---
    useEffect(() => {
        // Start call timer
        if (inCall && openConvoSession && !profileCallStartRef.current) {
            profileCallStartRef.current = Date.now();
            profileCallHandledRef.current = false;
        }

        // End call timer when call ends
        if (!inCall && openConvoSession && profileCallStartRef.current && !profileCallHandledRef.current) {
    const handleProfileCallEnd = async () => {
        profileCallHandledRef.current = true;
        const duration = Math.floor((Date.now() - profileCallStartRef.current!) / 1000);

        try {
            // First, fetch convo_id from the existing session
            const { data: sessionData, error: fetchError } = await supabase
                .from("convo_session")
                .select("convo_id")
                .eq("id", openConvoSession.convo_session_id)
                .maybeSingle();

            if (fetchError) {
                console.error("Failed to fetch convo_id:", fetchError);
                return;
            }

            if (!sessionData) {
                console.error("No session found with that id", openConvoSession.convo_session_id);
                return;
            }

            const convo_id = sessionData.convo_id;

            // Insert a new convo_session record
            const { data: insertData, error: insertError } = await supabase
                .from("convo_session")
                .insert({
                    convo_id,
                    duration,
                    transcript: transcriptionLog,
                    convo_session_reply_id: openConvoSession.convo_session_reply_id || null,
                });

            if (insertError) console.error("Profile call logging failed:", insertError);
            else console.log("New session inserted:", insertData);

        } catch (e) {
            console.error("Profile call logging exception:", e);
        }

        profileCallStartRef.current = null;
        setOpenConvoSession(null);
    };

    handleProfileCallEnd();
}

    }, [inCall, openConvoSession, transcriptionLog]);

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
