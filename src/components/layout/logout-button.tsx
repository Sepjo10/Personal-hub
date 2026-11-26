import { LogOut } from "lucide-react";
import { logout } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

/**
 * Botón de cerrar sesión. Es un formulario que llama a la Server Action logout,
 * así funciona incluso sin JavaScript.
 */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action={logout}>
      <button
        type="submit"
        className={cn(
          "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground",
          className,
        )}
      >
        <LogOut className="size-4" />
        Cerrar sesión
      </button>
    </form>
  );
}
