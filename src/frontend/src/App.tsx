import { Toaster } from "@/components/ui/sonner";
import { Menu } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { AddExpensePage } from "./pages/AddExpensePage";
import { Dashboard } from "./pages/Dashboard";
import { ManageBanks } from "./pages/ManageBanks";

type Page = "dashboard" | "add-expense" | "manage-banks";

const pageTitle: Record<Page, string> = {
  dashboard: "Dashboard",
  "add-expense": "Add Expense",
  "manage-banks": "Manage Banks",
};

export default function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AppSidebar
        currentPage={page}
        onNavigate={setPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 md:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-card border-b border-border h-14 flex items-center px-4 md:px-6 justify-between shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger - mobile only */}
            <button
              type="button"
              data-ocid="nav.menu.button"
              className="md:hidden p-1.5 rounded-md hover:bg-accent transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {pageTitle[page]}
              </span>
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {page === "dashboard" && <Dashboard onAddExpense={() => {}} />}
              {page === "add-expense" && <AddExpensePage />}
              {page === "manage-banks" && <ManageBanks />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="py-4 px-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>

      <Toaster richColors position="top-right" />
    </div>
  );
}
