
import "./globals.css";
import Navbar from "./_component/navbar"; 

export const metadata = {
  title: "Absensi App",
  description: "Sistem Absensi",
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
