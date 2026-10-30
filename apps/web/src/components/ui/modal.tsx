import * as React from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, description, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="w-full max-w-lg bg-white rounded-lg border border-[#E8E8EA] shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8EA] bg-[#F7F7F8]">
          <div>
            <h3 className="text-base font-semibold text-[#171717]">{title}</h3>
            {description && (
              <p className="text-xs text-[#777777] mt-0.5">{description}</p>
            )}
          </div>
          <button 
            onClick={onClose} 
            className="p-1 rounded-md text-[#777777] hover:text-[#171717] hover:bg-[#E8E8EA] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

