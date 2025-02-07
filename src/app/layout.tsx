import type { Metadata } from "next";
import { bricolage } from "@/lib/fonts";
import "./globals.css";
import "@worldcoin/mini-apps-ui-kit-react/styles.css";
import MiniKitProvider from "@/components/minikit-provider";
import dynamic from "next/dynamic";
import NextAuthProvider from "@/components/next-auth-provider";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "Ephemeral Chat",
  description: "Spontaneous convos, unfiltered ideas, self-destructing chats.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const ErudaProvider = dynamic(
    () => import("../components/Eruda").then((c) => c.ErudaProvider),
    {
      ssr: false,
    }
  );
  return (
    <html lang="en">
      <body className={bricolage.className}>
        <NextAuthProvider>
          <ErudaProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <MiniKitProvider>{children}</MiniKitProvider>
            </ThemeProvider>
          </ErudaProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
