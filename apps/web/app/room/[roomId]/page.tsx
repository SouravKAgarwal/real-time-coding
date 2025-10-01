import RoomEditor from "@/components/room-editor";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
  searchParams: Promise<{ username: string }>;
}

export default async function RoomPage({
  params,
  searchParams,
}: RoomPageProps) {
  const roomId = (await params).roomId;
  const username = (await searchParams).username;
  const userId = crypto.randomUUID();

  return <RoomEditor roomId={roomId} userId={userId} username={username} />;
}
