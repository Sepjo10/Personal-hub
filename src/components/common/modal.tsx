"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

/**
 * Ventana modal reutilizable basada en el elemento nativo <dialog>.
 * Es "controlada": el componente padre decide si está abierta (open) y
 * recibe onClose cuando el usuario la cierra (botón X, tecla Esc...).
 */
export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto rounded-2xl border border-border bg-popover p-0 text-foreground shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="rounded-lg p-1 text-muted-foreground hover:bg-white/5">
              <X className="size-5" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

/** Clases compartidas para campos de formulario. */
export const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-white/5 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";
export const labelClass = "mb-1.5 block text-sm text-muted-foreground";
