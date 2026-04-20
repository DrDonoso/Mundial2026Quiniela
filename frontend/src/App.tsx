import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminRoute } from "@/components/layout/AdminRoute";
import { Skeleton } from "@/components/ui/skeleton";

const LoginPage = lazy(() => import("@/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/pages/RegisterPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const PreTournamentPage = lazy(() => import("@/pages/PreTournamentPage"));
const GroupStagePage = lazy(() => import("@/pages/GroupStagePage"));
const KnockoutPage = lazy(() => import("@/pages/KnockoutPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const AdminPage = lazy(() => import("@/pages/AdminPage"));

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-6">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/predictions/pre-tournament"
              element={<PreTournamentPage />}
            />
            <Route path="/predictions/groups" element={<GroupStagePage />} />
            <Route path="/predictions/knockout" element={<KnockoutPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
