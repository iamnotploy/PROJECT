import { notFound } from "next/navigation";
import { RoomDetail } from "@/components/room-detail";
import { SiteHeader } from "@/components/site-header";
import { getRooms } from "@/lib/rooms";

type RawSearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function RoomDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<RawSearchParams> }) {
  const { id } = await params;
  const rawSearchParams = await searchParams;
  const rooms = await getRooms({ hotelId: firstValue(rawSearchParams.hotel), checkIn: firstValue(rawSearchParams.checkIn), checkOut: firstValue(rawSearchParams.checkOut) });
  const room = rooms.find((item) => item.id === id);
  if (!room) notFound();

  const bookingQuery = new URLSearchParams(Object.entries({ hotel: firstValue(rawSearchParams.hotel), destination: firstValue(rawSearchParams.destination), area: firstValue(rawSearchParams.area), checkIn: firstValue(rawSearchParams.checkIn), checkOut: firstValue(rawSearchParams.checkOut), guests: firstValue(rawSearchParams.guests), rooms: firstValue(rawSearchParams.rooms) }).filter((entry): entry is [string, string] => Boolean(entry[1]))).toString();

  return <><SiteHeader /><RoomDetail room={room} bookingQuery={bookingQuery} /></>;
}
