"use client";

import { useEffect, useState } from "react";
import { database } from "./lib/firebase";
import { ref, onValue } from "firebase/database";
import { firestore } from "./lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { addDoc } from "firebase/firestore";

export default function Home() { 

  return (
    <main>
      <div className="main-content">
        <div className="relative h-[300px]">
          <img
            src="/ovs.jpg"
            alt="ov"
            className="w-full h-full block bg-white"
          />
          <div className="absolute inset-0 bg-black/40 text-white flex flex-col items-center justify-center text-xl">
            <h1 className="font-bold text-2xl">
              Selamat Datang di Absensi Sikapak Timur
            </h1>
            <p className="mt-4 max-w-md text-center text-sm">
              Sistem absensi menggunakan sensor sidik jari dan data realtime.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white text-black p-4 rounded shadow mt-4">
        <h1 className="font-semibold text-lg">Reader</h1>
        <p className="text-sm mt-2 text-gray-600">
          Data pengguna yang baru melakukan scan:
        </p>

        <div className="mt-4 text-sm">
       
        </div>
      </div>
    </main>
  );
}
