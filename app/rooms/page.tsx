import { SiteHeader } from "@/components/site-header";
import { RoomsClient } from "@/components/rooms-client";
import { getRooms } from "@/lib/rooms";

export default async function RoomsPage() {
  const rooms = await getRooms();
  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><RoomsClient rooms={rooms} /></main>;
}
