"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

/**
 * Server Action: se ejecuta en el servidor cuando se envía el formulario de login.
 * La contraseña nunca pasa por nuestro código de cliente más allá del formulario.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Introduce tu correo y tu contraseña." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Se registra en el servidor (terminal o Logs de Vercel) para poder diagnosticar
    console.error("Login fallido:", error.code ?? "sin código", error.status ?? "", error.message);
    if (error.status === 429) return { error: "Demasiados intentos. Espera unos minutos y vuelve a probar." };
    if (error.code === "email_not_confirmed") return { error: "El correo de esta cuenta no está confirmado." };
    if (!error.status || error.status >= 500) return { error: "No se pudo contactar con el servidor de inicio de sesión." };
    // Credenciales: mensaje genérico, no revelamos si el correo existe o no
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/");
}

/** Cierra la sesión y vuelve al login. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
