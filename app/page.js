"use client";

import { useEffect, useState } from "react";
import DokumentasiCard from "./_component/doccard";

export default function Home() {
  return (
    <main>
      <div className="main-content">
        {/* Banner Section */}
        <div className="relative">
          <img
            src="banner1.webp"
            alt="banner"
            className="w-full h-full block bg-white object-cover"
          />
          <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center text-xl px-4 text-center">
            <h1 className="font-bold text-2xl sm:text-3xl">
              Selamat Datang di Absensi Desa Sikapak Timur
            </h1>
            <p className="mt-4 max-w-md text-sm sm:text-base">
              Sistem absensi berbasis digital menggunakan sensor sidik jari dan
              pencatatan kehadiran secara realtime.
            </p>
          </div>
        </div>

        {/* Dokumentasi Section */}
        <section className="py-10 px-4 max-w-5xl mx-auto">
          <DokumentasiCard />
        </section>
      </div>
      <footer className="bg-emerald-600 text-white py-6 mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-sm">
          <div className="mb-2 sm:mb-0 text-center sm:text-left">
            © {new Date().getFullYear()} Kantor Desa Sikapak Timur. All
            rights reserved.
          </div>
          <div className="text-center sm:text-right">
            Kontak:{" "}
            <a
              href="mailto:sikapak.absen@example.com"
              className="underline hover:text-gray-200"
            >
              sikapaktimur@gmail.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
