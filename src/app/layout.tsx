import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Barlow, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { cookies } from "next/headers";

const bodyFont = Barlow({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const displayFont = Barlow_Condensed({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Find My Car",
  description: "Keep track of where your family cars are parked.",
  applicationName: "Find My Car",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "Find My Car",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#061b2b",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const cookieLocale = await (async () => {
    try {
      const c = await cookies();
      const found = c.get("find-my-car-locale");
      return found?.value === "he" ? "he" : "en";
    } catch {
      return "en";
    }
  })();

  const dir = cookieLocale === "he" ? "rtl" : "ltr";

  return (
    <html
      lang={cookieLocale}
      dir={dir}
      className={`${bodyFont.variable} ${displayFont.variable}`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
