import { Suspense } from "react";
import AdminDashboard from "@/views/adm/dashboard";

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}
