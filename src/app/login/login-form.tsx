"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { login, type LoginState } from "@/features/auth/actions";

const inputClass =
  "h-10 w-full rounded-lg border border-input bg-white/5 px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

/**
 * Formulario de login. useActionState conecta el formulario con la Server Action
 * y nos da el estado devuelto (el mensaje de error) y si está enviándose (pending).
 */
export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm text-muted-foreground">Correo</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm text-muted-foreground">Contraseña</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" disabled={pending} className="h-10 w-full">
        {pending ? "Entrando…" : "Entrar"}
      </Button>
    </form>
  );
}
