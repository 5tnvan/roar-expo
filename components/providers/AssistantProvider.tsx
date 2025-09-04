// components/providers/AssistantProvider.tsx
import { Profile } from "@/types/types";
import React, { createContext, ReactNode, useContext } from "react";

type AssistantContextType = {
  callAssistant: (profile: Profile, convo_session_id: string) => void;
};

const AssistantContext = createContext<AssistantContextType>({
  callAssistant: () => {},
});

export const useAssistant = () => useContext(AssistantContext);

interface AssistantProviderProps {
  children: ReactNode;
  onCallAssistantWithAI: (profile: Profile, convo_session_id: string) => void;
}

export const AssistantProvider = ({ children, onCallAssistantWithAI }: AssistantProviderProps) => {
  const callAssistant = (profile: Profile, convo_session_id: string) => {
    onCallAssistantWithAI(profile, convo_session_id);
  };

  return (
    <AssistantContext.Provider value={{ callAssistant }}>
      {children}
    </AssistantContext.Provider>
  );
};
