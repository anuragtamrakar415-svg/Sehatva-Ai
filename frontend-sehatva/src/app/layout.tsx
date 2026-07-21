import type { Metadata } from "next";
import { AppStoreProvider } from "@/store/app-store";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Sehatva AI — Smart Care. Better Recovery.",
  description: "AI-powered recovery, medicine, and caregiving companion.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppStoreProvider>{children}</AppStoreProvider>
      </body>
    </html>
  );
}
