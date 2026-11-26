import { redirect } from "next/navigation";

// "/planificador" no tiene contenido propio: redirige a la primera pestaña.
export default function Page() {
  redirect("/planificador/hoy");
}
