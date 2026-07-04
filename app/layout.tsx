import type { Metadata, Viewport } from "next";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

export const metadata: Metadata = {
  title: "Bolão da Família",
  description: "Acompanhe o bolão em tempo real: placar ao vivo, ranking e prêmios.",
  openGraph: {
    title: "Bolão da Família",
    description: "Placar ao vivo, ranking e prêmios em tempo real.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0b0f0d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
