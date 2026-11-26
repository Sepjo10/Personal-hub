import { redirect } from "next/navigation";

// "/academico" no tiene contenido propio: redirige a la primera pestaña.
export default function Page() {
  redirect("/academico/universidad");
}
