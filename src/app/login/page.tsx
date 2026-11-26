import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Iniciar sesión" };

/**
 * Página de login. Está FUERA del grupo (app), así que no tiene menú lateral.
 * No hay página de registro: la cuenta se crea desde el panel de Supabase y el
 * registro público está desactivado, porque la app es solo para ti.
 */
export default function LoginPage() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="glass w-full max-w-sm rounded-2xl p-8">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-lg bg-primary font-bold text-primary-foreground">P</span>
          <h1 className="text-xl font-semibold tracking-tight">
            Personal <span className="text-primary">Hub</span>
          </h1>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
