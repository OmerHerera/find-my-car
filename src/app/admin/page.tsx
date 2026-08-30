import { redirect } from "next/navigation";
import AdminClient from "./admin-client";

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ secret?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const adminSecret = process.env.ADMIN_SECRET ?? "admin-secret";

  if (params.secret !== adminSecret) {
    redirect("/");
  }

  return <AdminClient />;
}
