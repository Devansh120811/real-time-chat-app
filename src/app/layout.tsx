
import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/toaster"
import { SocketProvider } from "@/context/SocketContext";
import { ChatProvider } from "@/context/Chat_context";
const poppins = Poppins({ subsets: ["latin"], weight: ["100", "200", "300", "400"] })
const roboto = Roboto({ subsets: ["latin"], weight: ["100"] })
export const metadata: Metadata = {
  title: "Chat App",
  description: "Chat Freely",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <ChatProvider>

            <SocketProvider>
              <body className={poppins.className}>
                {children}
                <Toaster />
              </body>
            </SocketProvider> 
        </ChatProvider>
      </AuthProvider>
    </html>
  );
}
