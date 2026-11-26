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

  // Mensaje genérico: no revelamos si el correo existe o no
  if (error) return { error: "Correo o contraseña incorrectos." };

  redirect("/");
}

/** Cierra la sesión y vuelve al login. */
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
