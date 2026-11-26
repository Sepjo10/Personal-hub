"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";

/**
 * Pie común de los formularios: Eliminar (con confirmación) · Cancelar · Guardar.
 * onDelete es opcional (solo al editar). Si devuelve ok, se llama a onDone.
 */
export function FormActions({
  pending,
  onCancel,
  onDelete,
  onDone,
}: {
  pending: boolean;
  onCancel: () => void;
  onDelete?: () => Promise<{ ok: boolean }>;
  onDone: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, startDelete] = useTransition();

  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      {onDelete ? (
        confirming ? (
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={() => startDelete(async () => { if ((await onDelete()).ok) onDone(); })}
          >
            {deleting ? "Eliminando…" : "¿Seguro? Eliminar"}
          </Button>
        ) : (
          <Button type="button" variant="ghost" onClick={() => setConfirming(true)} className="text-muted-foreground">
            Eliminar
          </Button>
        )
      ) : (
        <span />
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={pending}>{pending ? "Guardando…" : "Guardar"}</Button>
      </div>
    </div>
  );
}
