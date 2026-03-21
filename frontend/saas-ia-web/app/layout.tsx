import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ELYON OS",
  description:
    "Sistema operacional empresarial com inteligência artificial para operações, automações e gestão multi-unidade.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
