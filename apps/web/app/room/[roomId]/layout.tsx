import { ReactNode } from "react";
import { Header } from "@/components/header";

interface EditorLayoutProps {
  children: ReactNode;
  params: Promise<{ roomId: string }>;
}

export default async function EditorLayout({
  children,
  params,
}: EditorLayoutProps) {
  const { roomId } = await params;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-950">
      <Header roomId={roomId} />

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
