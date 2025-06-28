import "./globals.css";
import Navbar from "./_component/navbar";

export const metadata = {
  title: "Absensi Sikapak Timur",
  description: "Sistem Absensi",
  icons: {
    icon: "favicon.png", // bisa juga "/favicon.png"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="text-white min-h-screen">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
