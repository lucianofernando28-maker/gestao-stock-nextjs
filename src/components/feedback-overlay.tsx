"use client";

import { AlertCircle, CheckCircle2, X } from "lucide-react";

export interface FeedbackState {
  type: "success" | "error";
  message: string;
}

//Modal de mensagens de erros e sucesso
interface FeedbackOverlayProps {
  feedback: FeedbackState | null;
  onCloseError: () => void;
}

export function FeedbackOverlay({ feedback, onCloseError }: FeedbackOverlayProps) {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";

  return (   
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in px-6">          
      <div className="w-full max-w-md rounded-xl bg-slate-300 p-6 shadow-2xl text-slate-900 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <CheckCircle2 size={56} className="text-emerald-600 mb-3 animate-bounce" />
            <h4 className="text-xl font-bold text-slate-900 mb-1">Sucesso!</h4>
            <p className="text-sm text-slate-600 font-medium px-4">{feedback.message}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <AlertCircle size={56} className="text-red-600 mb-3" />
            <h4 className="text-xl font-bold text-slate-900 mb-1">Operação Falhou</h4>
            <p className="text-sm text-red-700 font-medium mb-5 px-4">{feedback.message}</p>
            
            <button
              type="button"
              onClick={onCloseError}
              className="flex items-center gap-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs px-4 py-2 border border-red-200 transition cursor-pointer shadow-xs"
            >
              <X size={14} />
              Sair
            </button>
          </div>
        )}

      </div>
    </div>
  );
}