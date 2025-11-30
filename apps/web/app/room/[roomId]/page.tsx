import RoomEditor from "@/components/room-editor";

interface RoomPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomPage({ params }: RoomPageProps) {
  const roomId = (await params).roomId;

  return <RoomEditor roomId={roomId} />;
}
