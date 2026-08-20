import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LUMA Mukdahan | จองที่พักในมุกดาหาร",
  description: "ระบบจองห้องพักโรงแรมออนไลน์ในจังหวัดมุกดาหาร",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
