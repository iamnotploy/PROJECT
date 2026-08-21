import { createClient } from "@/lib/supabase/server";
import { rooms as demoRooms, type Room } from "@/lib/data";

export type Hotel = { id: string; name: string; address: string; phone?: string; amenities?: string[] };

type HotelRecord = { id: string; name: string; address: string | null; phone: string | null; amenities: string[] | null };
type RoomTypeRecord = { id: string; hotel_id?: string; name: string; description: string | null; base_price: number | string; max_guests: number; size_sqm: number | string | null; bed_description?: string | null; bathrooms?: number | string | null; amenities: string[] | null; image_url: string | null; rooms: Array<{ id: string; room_number: string; status: string }> };

function locationForRoom(name: string) {
  if (name.toLowerCase().includes("river")) return "ริมโขง · มุกดาหาร";
  if (name.toLowerCase().includes("garden")) return "มุกดาหาร · ใกล้ตลาดอินโดจีน";
  return "ใจกลางเมือง · มุกดาหาร";
}

function accentForRoom(name: string) {
  if (name.toLowerCase().includes("river")) return "from-[#0d403d] to-[#1c8b78]";
  if (name.toLowerCase().includes("garden")) return "from-[#294b37] to-[#72a66b]";
  return "from-[#463326] to-[#b27643]";
}

function bedDescriptionForRoom(name: string, guests: number) {
  const normalized = name.toLowerCase();
  if (normalized.includes("garden")) return "2 เตียงเดี่ยว";
  if (normalized.includes("mekong")) return "1 เตียงคิงไซส์ + โซฟาเบด";
  return guests > 2 ? "1 เตียงคิงไซส์ + โซฟาเบด" : "1 เตียงคิงไซส์";
}

export async function getHotels(): Promise<Hotel[]> {
  const supabase = await createClient();
  if (!supabase) return [{ id: "legacy", name: "LUMA Mukdahan", address: "มุกดาหาร" }];
  const { data, error } = await supabase.from("hotels").select("id, name, address, phone, amenities").eq("status", "active").order("created_at");
  if (error || !data?.length) return [{ id: "legacy", name: "LUMA Mukdahan", address: "มุกดาหาร" }];
  return (data as HotelRecord[]).map((hotel) => ({ id: hotel.id, name: hotel.name, address: hotel.address || "มุกดาหาร", phone: hotel.phone || undefined, amenities: hotel.amenities || [] }));
}

export async function getRooms(options: { hotelId?: string; checkIn?: string; checkOut?: string; guests?: number } = {}): Promise<Room[]> {
  const supabase = await createClient();
  if (!supabase) return demoRooms;

  const legacyMode = !options.hotelId || options.hotelId === "legacy";
  const firstQuery = legacyMode
    ? await supabase.from("room_types").select("id, name, description, base_price, max_guests, size_sqm, bed_description, bathrooms, amenities, image_url, rooms(id, room_number, status)").order("base_price", { ascending: true })
    : await supabase.from("room_types").select("id, hotel_id, name, description, base_price, max_guests, size_sqm, bed_description, bathrooms, amenities, image_url, rooms(id, room_number, status)").eq("hotel_id", options.hotelId).order("base_price", { ascending: true });
  let data: unknown[] | null = firstQuery.data as unknown[] | null;
  let error = firstQuery.error;

  if (error && legacyMode) {
    const fallbackQuery = await supabase.from("room_types").select("id, name, description, base_price, max_guests, size_sqm, amenities, image_url, rooms(id, room_number, status)").order("base_price", { ascending: true });
    data = fallbackQuery.data as unknown[] | null;
    error = fallbackQuery.error;
  }
  if (error || !data?.length) return options.hotelId && options.hotelId !== "legacy" ? [] : demoRooms;

  const records = data as unknown as RoomTypeRecord[];
  const roomIds = records.flatMap((record) => record.rooms.map((room) => room.id));
  const availableRoomIds = new Set(roomIds);
  if (options.checkIn && options.checkOut && roomIds.length) {
    const availabilityQuery = await supabase.rpc("get_available_room_ids", { p_room_ids: roomIds, p_check_in: options.checkIn, p_check_out: options.checkOut });
    if (!availabilityQuery.error && availabilityQuery.data) {
      availableRoomIds.clear();
      for (const room of availabilityQuery.data as { room_id: string }[]) availableRoomIds.add(room.room_id);
    }
  }

  return records.filter((record) => !options.guests || Number(record.max_guests) >= options.guests).flatMap((record, index) => record.rooms
    .filter((room) => room.status === "available" && availableRoomIds.has(room.id))
    .map((room) => mapRoomType(record, room, index, options.hotelId))
    .filter((room): room is Room => room !== null));
}

function mapRoomType(record: RoomTypeRecord, room: { id: string; room_number: string }, index: number, hotelId?: string): Room {
  const amenities = record.amenities ?? [];
  const guests = Number(record.max_guests);
  const size = record.size_sqm ? `${Number(record.size_sqm).toLocaleString("th-TH")} ตร.ม.` : "ขนาดกำลังดี";
  return {
    id: room.id,
    roomNumber: room.room_number,
    hotelId: record.hotel_id || hotelId,
    name: record.name,
    description: record.description ?? "ห้องพักออกแบบอย่างอบอุ่น พร้อมพื้นที่ใช้งานที่ลงตัวสำหรับการพักผ่อน",
    property: hotelId === "legacy" ? "LUMA Mukdahan" : "โรงแรมที่พัก",
    location: locationForRoom(record.name),
    price: Number(record.base_price),
    rating: 0,
    reviews: 0,
    guests,
    beds: record.bed_description || bedDescriptionForRoom(record.name, guests),
    bathrooms: Number(record.bathrooms ?? 1),
    size,
    tags: amenities.slice(0, 2),
    amenities,
    image: record.image_url ?? demoRooms[index % demoRooms.length].image,
    accent: accentForRoom(record.name),
    featured: index < 2,
  };
}
