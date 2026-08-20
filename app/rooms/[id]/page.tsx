import { notFound } from "next/navigation";
import { RoomDetail } from "@/components/room-detail";
import { SiteHeader } from "@/components/site-header";
import { getRooms } from "@/lib/rooms";

export default async function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rooms = await getRooms();
  const room = rooms.find((item) => item.id === id);
  if (!room) notFound();

  return <><SiteHeader /><RoomDetail room={room} /></>;
}
