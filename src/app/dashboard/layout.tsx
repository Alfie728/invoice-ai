import type React from "react";
import "@/styles/globals.css";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata = {
  title: "Invoice Parser Dashboard",
  description: "Dashboard for managing and processing invoices",
};

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <DashboardLayout>{children}</DashboardLayout>
    </main>
  );
}
