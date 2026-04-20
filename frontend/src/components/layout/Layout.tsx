import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Footer } from "./Footer";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background bg-pitch-pattern">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto max-w-6xl p-4 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
