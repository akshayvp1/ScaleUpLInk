import { createContext, useContext } from "react";
import type { CallContextValue } from "../../types/call/call.types";

export const CallContext = createContext<CallContextValue | null>(null);

export function useCall(): CallContextValue {
  const context = useContext(CallContext);

  if (!context) {
    throw new Error("useCall must be used inside CallProvider");
  }

  return context;
}
