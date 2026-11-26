import { redirect } from "next/navigation";

// "/ocio" no tiene contenido propio: redirige a la primera pestaña.
export default function Page() {
  redirect("/ocio/lecturas");
}
