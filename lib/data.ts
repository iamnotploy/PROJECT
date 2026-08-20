export type Room = {
  id: string;
  name: string;
  description?: string;
  property: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  guests: number;
  beds: string;
  bathrooms?: number;
  size: string;
  tags: string[];
  amenities: string[];
  image: string;
  accent: string;
  featured?: boolean;
};

export const rooms: Room[] = [
  {
    id: "luma-river-deluxe",
    name: "River View Deluxe",
    property: "LUMA Riverside Hotel",
    location: "ริมโขง · มุกดาหาร",
    price: 2200,
    rating: 4.9,
    reviews: 128,
    guests: 2,
    beds: "1 เตียงคิงไซส์",
    size: "32 ตร.ม.",
    tags: ["วิวแม่น้ำ", "อาหารเช้าฟรี"],
    amenities: ["Wi-Fi ฟรี", "อาหารเช้า", "ที่จอดรถ", "สระว่ายน้ำ"],
    image: "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#0d403d] to-[#1c8b78]",
    featured: true,
  },
  {
    id: "mekong-suite",
    name: "Mekong Corner Suite",
    property: "The Mekong House",
    location: "ศรีบุญเรือง · มุกดาหาร",
    price: 3150,
    rating: 4.8,
    reviews: 84,
    guests: 3,
    beds: "1 เตียงคิงไซส์ + โซฟาเบด",
    size: "48 ตร.ม.",
    tags: ["ห้องกว้าง", "วิวเมือง"],
    amenities: ["Wi-Fi ฟรี", "อ่างอาบน้ำ", "มินิบาร์", "ฟิตเนส"],
    image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#463326] to-[#b27643]",
    featured: true,
  },
  {
    id: "baan-chao-pond",
    name: "Garden Calm Room",
    property: "บ้านเจ้าสำราญ",
    location: "มุกดาหาร · ใกล้ตลาดอินโดจีน",
    price: 1450,
    rating: 4.7,
    reviews: 56,
    guests: 2,
    beds: "2 เตียงเดี่ยว",
    size: "28 ตร.ม.",
    tags: ["เงียบสงบ", "คุ้มค่า"],
    amenities: ["Wi-Fi ฟรี", "ที่จอดรถ", "สวนส่วนกลาง"],
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#294b37] to-[#72a66b]",
  },
  {
    id: "indochina-family",
    name: "Indochina Family Loft",
    property: "Rim Khong Residence",
    location: "มุกดาหาร · ใจกลางเมือง",
    price: 2600,
    rating: 4.6,
    reviews: 42,
    guests: 4,
    beds: "2 เตียงคิงไซส์",
    size: "55 ตร.ม.",
    tags: ["เหมาะกับครอบครัว", "ครัวเล็ก"],
    amenities: ["Wi-Fi ฟรี", "ครัวเล็ก", "เครื่องซักผ้า", "ที่จอดรถ"],
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#2d3b61] to-[#7083bb]",
  },
  {
    id: "minimal-city-view",
    name: "Minimal City View",
    property: "Hug Mukdahan Hotel",
    location: "มุกดาหาร · ถนนชยางกูร",
    price: 1790,
    rating: 4.5,
    reviews: 96,
    guests: 2,
    beds: "1 เตียงคิงไซส์",
    size: "30 ตร.ม.",
    tags: ["ทำเลดี", "เช็กอินง่าย"],
    amenities: ["Wi-Fi ฟรี", "คาเฟ่", "ที่จอดรถ", "แผนกต้อนรับ 24 ชม."],
    image: "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#2e2c44] to-[#9285bc]",
  },
  {
    id: "sunset-balcony",
    name: "Sunset Balcony Room",
    property: "Mekong Breeze Inn",
    location: "ริมโขง · แก่งกะเบา",
    price: 1980,
    rating: 4.8,
    reviews: 73,
    guests: 2,
    beds: "1 เตียงคิงไซส์",
    size: "35 ตร.ม.",
    tags: ["ระเบียงส่วนตัว", "วิวพระอาทิตย์ตก"],
    amenities: ["Wi-Fi ฟรี", "ระเบียง", "จักรยานให้ยืม", "อาหารเช้า"],
    image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=85",
    accent: "from-[#5b321d] to-[#e39e62]",
  },
];

export const popularAreas = [
  { name: "ริมโขง", count: "12 ที่พัก", image: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=700&q=80" },
  { name: "ใจกลางเมือง", count: "28 ที่พัก", image: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=700&q=80" },
  { name: "แก่งกะเบา", count: "9 ที่พัก", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=700&q=80" },
];

export type DashboardBooking = {
  id: string;
  guest: string;
  room: string;
  dates: string;
  amount: number;
  status: string;
};

export const dashboardBookings: DashboardBooking[] = [
  { id: "LM-240817", guest: "คุณพิมพ์ชนก ศรีสุข", room: "River View Deluxe", dates: "21 - 23 ส.ค. 69", amount: 4400, status: "ยืนยันแล้ว" },
  { id: "LM-240816", guest: "คุณณัฐวุฒิ ใจดี", room: "Garden Calm Room", dates: "22 - 24 ส.ค. 69", amount: 2900, status: "รอเช็กอิน" },
  { id: "LM-240815", guest: "คุณกัญญารัตน์ ทองมี", room: "Mekong Corner Suite", dates: "23 - 26 ส.ค. 69", amount: 9450, status: "ชำระแล้ว" },
  { id: "LM-240814", guest: "คุณอาทิตย์ แสงทอง", room: "Minimal City View", dates: "24 - 25 ส.ค. 69", amount: 1790, status: "รอชำระเงิน" },
];

export type DashboardStat = {
  label: string;
  value: string;
  change: string;
  caption: string;
  accent: "brand" | "gold" | "coral" | "purple";
};

export type DashboardData = {
  stats: DashboardStat[];
  bookings: DashboardBooking[];
  revenue: { label: string; amount: number }[];
  bookingBadge: number;
  todayLabel: string;
  roomSummary: { available: number; total: number };
};

export const dashboardStats: DashboardStat[] = [
  { label: "รายได้เดือนนี้", value: "฿184,920", change: "+18.6%", caption: "เทียบกับเดือนก่อน", accent: "brand" },
  { label: "อัตราเข้าพัก", value: "78.4%", change: "+6.2%", caption: "จากห้องทั้งหมด 48 ห้อง", accent: "gold" },
  { label: "การจองใหม่", value: "126", change: "+12.4%", caption: "ในช่วง 30 วันที่ผ่านมา", accent: "coral" },
  { label: "คะแนนรีวิวเฉลี่ย", value: "4.8 / 5", change: "+0.2", caption: "จาก 486 รีวิว", accent: "purple" },
];

export const dashboardRevenue = [
  { label: "ก.ย.", amount: 42000 },
  { label: "ต.ค.", amount: 58000 },
  { label: "พ.ย.", amount: 50000 },
  { label: "ธ.ค.", amount: 78000 },
  { label: "ม.ค.", amount: 68000 },
  { label: "ก.พ.", amount: 91000 },
  { label: "มี.ค.", amount: 74000 },
  { label: "เม.ย.", amount: 84000 },
  { label: "พ.ค.", amount: 65000 },
  { label: "มิ.ย.", amount: 96000 },
  { label: "ก.ค.", amount: 81000 },
  { label: "ส.ค.", amount: 88000 },
];
