import localFont from "next/font/local";
import "./globals.css";
import { type Metadata } from "next";
import { Toaster } from "sonner";

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
  const s = await fetch(
    process.env.NEXT_PUBLIC_SERVER_URL ||
      "https://real-time-coding-f4vt.onrender.com/"
  );

  console.log(s);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
