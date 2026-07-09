import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import ClientEffects from "@/components/ClientEffects";
import CursorDot from "@/components/CursorDot";

const SITE_URL = "https://aanyabyhiranya.com";
const SITE_DESCRIPTION = "Hiranya is a multidisciplinary artist working across acrylic painting, pressed flower jewellery, resin art, and sustainable crafts.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "AanyaByHiranya — Art rooted in nature, memory, and slow intention.",
    template: "%s | AanyaByHiranya",
  },
  description: SITE_DESCRIPTION,
  icons: { icon: "/logo.png", apple: "/logo.png" },
  openGraph: {
    title: "AanyaByHiranya",
    description: "Art rooted in nature, memory, and slow intention.",
    url: SITE_URL,
    siteName: "AanyaByHiranya",
    type: "website",
    images: [{ url: "/hero.png", width: 2245, height: 1587, alt: "AanyaByHiranya" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AanyaByHiranya",
    description: "Art rooted in nature, memory, and slow intention.",
    images: ["/hero.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ThemeProvider>
          <CursorDot />
          <Nav />
          <main>{children}</main>
          <Footer />
          <ClientEffects />
        </ThemeProvider>
      </body>
    </html>
  );
}
