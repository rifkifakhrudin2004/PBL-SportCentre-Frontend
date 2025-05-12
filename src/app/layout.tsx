import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context";
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Reservasi Sport Center",
  description: "Aplikasi reservasi lapangan olahraga terbaik dan terlengkap",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>
        <Providers>
        {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
