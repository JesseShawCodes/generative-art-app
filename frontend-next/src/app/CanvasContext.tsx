"use client";
import { createContext, useContext, useRef } from "react";
import type { ReactNode, RefObject } from "react";

export interface CanvasExportMeta {
  algorithm: string;
  seed: number | null;
}

interface CanvasContextType {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  exportMetaRef: RefObject<CanvasExportMeta | null>;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export function useCanvas(): CanvasContextType {
  const context = useContext(CanvasContext);
  if (context === undefined) {
    throw new Error("useCanvas must be used within a CanvasProvider");
  }
  return context;
}

interface CanvasProviderProps {
  children: ReactNode;
}

export function CanvasProvider({ children }: CanvasProviderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportMetaRef = useRef<CanvasExportMeta | null>(null);

  return (
    <CanvasContext.Provider value={{ canvasRef, exportMetaRef }}>
      {children}
    </CanvasContext.Provider>
  );
}
