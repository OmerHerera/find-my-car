import HomeClient from "./home.client";
import { cookies } from "next/headers";
import { type Locale } from "@/lib/translations";

export default async function Page() {
  const c = await cookies();
  const cookie = c.get("find-my-car-locale");
  const initialLocale = (cookie?.value === "he" ? "he" : "en") as Locale;

  return <HomeClient initialLocale={initialLocale} />;
}
