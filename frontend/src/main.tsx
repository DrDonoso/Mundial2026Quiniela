import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/authStore";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Init({ children }: { children: React.ReactNode }) {
  const { fetchUser, isAuthenticated } = useAuthStore();

  React.useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, []);

  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Init>
          <App />
        </Init>
      </ToastProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
