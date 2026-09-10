'use client';

import { useToast, type ToastMessage } from '@/lib/toast-context';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function ToastCard({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl p-4 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 border',
        isError && 'bg-rose-950 text-rose-50 border-rose-800/80 shadow-rose-950/50',
        isSuccess && 'bg-[#14309c] text-white border-amber-500/50 shadow-black/60',
        isWarning && 'bg-amber-950 text-amber-50 border-amber-800/80 shadow-amber-950/50',
        toast.type === 'info' && 'bg-[#14309c] text-white border-blue-700 shadow-blue-950/50',
      )}
      role="alert"
    >
      <div className="mt-0.5 shrink-0">
        {isSuccess && <CheckCircle2 className="h-5 w-5 text-amber-400" />}
        {isError && <AlertCircle className="h-5 w-5 text-rose-400" />}
        {isWarning && <AlertTriangle className="h-5 w-5 text-amber-400" />}
        {toast.type === 'info' && <Info className="h-5 w-5 text-blue-400" />}
      </div>

      <div className="flex-1 space-y-0.5 min-w-0">
        <h4 className="font-sans text-xs font-bold leading-tight tracking-wide uppercase">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-xs opacity-90 leading-snug line-clamp-3">
            {toast.description}
          </p>
        )}
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="mt-0.5 shrink-0 rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
        aria-label="Close message"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Toaster() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0"
    >
      {toasts.map((t) => (
        <ToastCard key={t.id} toast={t} onDismiss={removeToast} />
      ))}
    </div>
  );
}
