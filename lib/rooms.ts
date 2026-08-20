import { createClient } from "@/lib/supabase/server";
import { rooms as demoRooms, type Room } from "@/lib/data";

type RoomTypeRecord = {
  id: string;
  name: string;
  description: string | null;
  base_price: number | string;
  max_guests: number;
  size_sqm: number | string | null;
  bed_description?: string | null;
  bathrooms?: number | string | null;
  amenities: string[] | null;
  image_url: string | null;
  rooms: Array<{ id: string; room_number: string; status: string }>;
};

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

function mapRoomType(record: RoomTypeRecord, index: number): Room | null {
  const availableRoom = record.rooms.find((room) => room.status !== "maintenance");
  if (!availableRoom) return null;

  const amenities = record.amenities ?? [];
  const guests = Number(record.max_guests);
  const size = record.size_sqm ? `${Number(record.size_sqm).toLocaleString("th-TH")} ตร.ม.` : "ขนาดกำลังดี";

  return {
    id: availableRoom.id,
    name: record.name,
    description: record.description ?? "ห้องพักออกแบบอย่างอบอุ่น พร้อมพื้นที่ใช้งานที่ลงตัวสำหรับการพักผ่อน",
    property: "LUMA Mukdahan",
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

export async function getRooms(): Promise<Room[]> {
  const supabase = await createClient();
  if (!supabase) return demoRooms;

  const selectWithDetails = "id, name, description, base_price, max_guests, size_sqm, bed_description, bathrooms, amenities, image_url, rooms(id, room_number, status)";
  const firstQuery = await supabase
    .from("room_types")
    .select(selectWithDetails)
    .order("base_price", { ascending: true });
  let data: unknown[] | null = firstQuery.data as unknown[] | null;
  let error = firstQuery.error;

  if (error) {
    const fallbackQuery = await supabase
      .from("room_types")
      .select("id, name, description, base_price, max_guests, size_sqm, amenities, image_url, rooms(id, room_number, status)")
      .order("base_price", { ascending: true });
    data = fallbackQuery.data as unknown[] | null;
    error = fallbackQuery.error;
  }

  if (error || !data?.length) return demoRooms;

  const liveRooms = (data as unknown as RoomTypeRecord[])
    .map(mapRoomType)
    .filter((room): room is Room => room !== null);

  return liveRooms.length ? liveRooms : demoRooms;
}
