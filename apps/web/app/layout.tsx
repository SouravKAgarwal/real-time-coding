import localFont from "next/font/local";
import "./globals.css";
import { type Metadata } from "next";
import { Toaster } from "sonner";
import { SocketProvider } from "@/components/providers/socket-provider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "CodeCollab - Real-Time Collaborative Coding",
  description:
    "Join CodeCollab to code together in real-time. Create or join coding rooms and collaborate seamlessly with your team.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const serverUrl =
    process.env.NEXT_PUBLIC_SERVER_URL ||
    "https://real-time-coding-f4vt.onrender.com/";

  let isServerUp = false;

  try {
    const res = await fetch(serverUrl, { cache: "no-store" });
    isServerUp = res.ok;
  } catch (err) {
    console.error("Server is unreachable:", err);
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {isServerUp ? (
          <SocketProvider>
            {children}
            <Toaster position="bottom-right" richColors />
          </SocketProvider>
        ) : (
          <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                Server unavailable
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Please try again later.
              </p>
            </div>
          </div>
        )}
      </body>
    </html>
  );
}
