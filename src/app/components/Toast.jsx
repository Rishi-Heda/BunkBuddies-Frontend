"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

let showToastExternal = null;
let pendingToast = null;

export const showToast = (message, variant = "success") => {
  let safeMessage = message;

  if (typeof message === "object") {
    safeMessage = message?.message || message?.error || JSON.stringify(message);
  }

  const toastData = { message: String(safeMessage), variant };

  if (showToastExternal) {
    showToastExternal(toastData.message, toastData.variant);
  } else {
    pendingToast = toastData;
  }
};

export default function ToastProvider() {
  const [toast, setToast] = useState(null);
  const [isLeaving, setIsLeaving] = useState(false);
  const closeToast = () => {
    setIsLeaving(true);

    setTimeout(() => {
        setToast(null);
        setIsLeaving(false);
    }, 450); // must match toastOut animation
  };

  useEffect(() => {
    showToastExternal = (message, variant) => {
        setIsLeaving(false); // reset animation state
        setToast({ message, variant });
    };

    // flush any pending toast
    if (pendingToast) {
      setToast(pendingToast);
      pendingToast = null;
    }

    return () => {
      showToastExternal = null;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(closeToast, 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const variants = {
    success: { bg: "bg-green-400", icon: <CheckCircle2 size={20} /> },
    error: { bg: "bg-red-500", icon: <AlertCircle size={20} /> },
    info: { bg: "bg-blue-400", icon: <Info size={20} /> },
  };

  const current = variants[toast.variant] || variants.success;

  return (
    <div className={`fixed bottom-6 right-6 z-[9999] ${isLeaving ? "animate-toastOut" : "animate-toastIn"}`}>
      <div className={`${current.bg} text-black min-w-[320px] px-5 py-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_black] flex items-center gap-3 font-semibold`}>
        {current.icon}
        <p className="flex-1">{toast.message}</p>
        <button onClick={closeToast} className="hover:scale-110 transition">
          <X size={18} />
        </button>
      </div>
    </div>
  );
}