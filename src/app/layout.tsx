import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { CursorProvider } from "@/context/CursorContext";
import { SmoothScrollProvider } from "@/context/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Harsh — Creative Developer Portfolio",
  description:
    "Independent creative developer crafting high-end websites, immersive 3D experiences and interactive interfaces.",
  metadataBase: new URL("https://lama-portfolio.local"),
  openGraph: {
    title: "Harsh — Creative Developer",
    description: "High-end websites, immersive 3D & interactive interfaces.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrains.variable} antialiased`}
    >
      <body className="min-h-screen bg-background text-foreground font-sans selection:bg-white selection:text-black">
        <CursorProvider>
          <SmoothScrollProvider>
            <CustomCursor />
            {children}
          </SmoothScrollProvider>
        </CursorProvider>
      </body>
    </html>
  );
}
