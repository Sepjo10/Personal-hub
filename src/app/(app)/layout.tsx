import { AppSidebar } from "@/components/layout/app-sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { QuickAddButton } from "@/components/layout/quick-add-button";
import { TaskDialogProvider } from "@/features/planner/task-dialog";

/**
 * Layout de la aplicación privada. Los paréntesis de "(app)" crean un
 * "route group": agrupa rutas sin añadir nada a la URL. La página de login
 * vive fuera de este grupo, por eso no tiene menú.
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    // TaskDialogProvider permite abrir el diálogo de tareas desde cualquier sección
    <TaskDialogProvider>
      <AppSidebar />
      {/* En escritorio dejamos 16rem (md:pl-64) a la izquierda para el menú fijo */}
      <div className="md:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 pt-6 pb-28 md:px-8 md:pt-10 md:pb-12">
          {children}
        </main>
      </div>
      <QuickAddButton />
      <MobileNav />
    </TaskDialogProvider>
  );
}
