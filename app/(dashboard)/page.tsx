import { redirect } from "next/navigation";

/** Legacy route — main admin dashboard lives at /dashboard/dashboard */
export default function DashboardRootPage() {
  redirect("/dashboard/dashboard");
}
