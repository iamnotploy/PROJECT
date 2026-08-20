import { BookingFlow } from "@/components/booking-flow";
import { SiteHeader } from "@/components/site-header";
import { getRooms } from "@/lib/rooms";

export default async function BookingPage({ searchParams }: { searchParams: Promise<{ room?: string }> }) {
  const params = await searchParams;
  const rooms = await getRooms();
  const room = rooms.find((item) => item.id === params.room) ?? rooms[0];
  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><BookingFlow room={room} /></main>;
}
