import { Building2, LayoutDashboard, PlusCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

type Page = "dashboard" | "add-expense" | "manage-banks";

interface AppSidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { id: "add-expense", label: "Add Expense", icon: <PlusCircle size={18} /> },
  { id: "manage-banks", label: "Manage Banks", icon: <Building2 size={18} /> },
];

function SidebarContent({
  currentPage,
  onNavigate,
  onClose,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onClose?: () => void;
}) {
  return (
    <div
      className="flex flex-col h-full w-60"
      style={{
        background: "linear-gradient(180deg, #0B1F36 0%, #112C4A 100%)",
      }}
    >
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">E</span>
          </div>
          <div>
            <div className="text-white font-semibold text-sm leading-tight">
              ExpenseTrack
            </div>
            <div className="text-white/50 text-xs">Finance Manager</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="md:hidden text-white/50 hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1" data-ocid="sidebar.panel">
        {navItems.map((item) => (
          <button
            type="button"
            key={item.id}
            data-ocid={`nav.${item.id}.link`}
            onClick={() => {
              onNavigate(item.id);
              onClose?.();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
              currentPage === item.id
                ? "bg-primary text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-white/10">
        <p className="text-white/30 text-xs">
          © {new Date().getFullYear()} ExpenseTrack
        </p>
      </div>
    </div>
  );
}

export function AppSidebar({
  currentPage,
  onNavigate,
  isOpen = false,
  onClose,
}: AppSidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-60 flex-col z-30">
        <SidebarContent currentPage={currentPage} onNavigate={onNavigate} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/50 md:hidden"
              onClick={onClose}
            />
            {/* Drawer */}
            <motion.aside
              key="drawer"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-full z-50 md:hidden"
            >
              <SidebarContent
                currentPage={currentPage}
                onNavigate={onNavigate}
                onClose={onClose}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
