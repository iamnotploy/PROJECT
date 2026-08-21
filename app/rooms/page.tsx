import { SiteHeader } from "@/components/site-header";
import { RoomsClient, type RoomSearchParams } from "@/components/rooms-client";
import { getHotels, getRooms } from "@/lib/rooms";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RoomsPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  const params = await searchParams;
  const roomSearch: RoomSearchParams = {
    destination: firstValue(params.destination),
    hotelId: firstValue(params.hotel),
    area: firstValue(params.area),
    checkIn: firstValue(params.checkIn),
    checkOut: firstValue(params.checkOut),
    guests: firstValue(params.guests),
    roomCount: firstValue(params.rooms),
  };
  const hotels = await getHotels();
  const rooms = roomSearch.hotelId ? await getRooms({ hotelId: roomSearch.hotelId, checkIn: roomSearch.checkIn, checkOut: roomSearch.checkOut, guests: Number(roomSearch.guests || 1) }) : [];

  return <main className="min-h-screen bg-[#f8faf9]"><SiteHeader /><RoomsClient hotels={hotels} rooms={rooms} searchParams={roomSearch} /></main>;
}
