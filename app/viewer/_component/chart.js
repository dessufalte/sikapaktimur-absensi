import { useEffect, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase";
import dayjs from "dayjs";

import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StackedAbsensiChart({ filter, dataFromApi = null }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const processData = (rawData) => {
      const grouped = {};
      const now = dayjs();
      let startDate;
      let labels = [];

      if (filter === "minggu") {
        const monday = now.startOf("week").add(1, "day");
        startDate = monday;
        labels = Array.from({ length: 7 }, (_, i) =>
          monday.add(i, "day").format("YYYY-MM-DD")
        );
        labels.forEach((tgl) => {
          grouped[tgl] = { hadir: 0, izin: 0, sakit: 0, alfa: 0, terlambat: 0 };
        });
      } else if (filter === "bulan") {
        for (let i = 11; i >= 0; i--) {
          const label = now.subtract(i, "month").format("YYYY-MM");
          grouped[label] = {
            hadir: 0,
            izin: 0,
            sakit: 0,
            alfa: 0,
            terlambat: 0,
          };
          labels.push(label);
        }
      } else if (filter === "tahun") {
        for (let i = 9; i >= 0; i--) {
          const year = now.subtract(i, "year").format("YYYY");
          grouped[year] = {
            hadir: 0,
            izin: 0,
            sakit: 0,
            alfa: 0,
            terlambat: 0,
          };
          labels.push(year);
        }
      }

      rawData.forEach((item) => {
        const timestamp = item.timestamp;
        const status = item.status?.toLowerCase();

        if (!timestamp || !status) return;

        let dateObj;

        if (timestamp instanceof Timestamp) {
          dateObj = timestamp.toDate();
        } else if (typeof timestamp === "object" && "_seconds" in timestamp) {
          dateObj = new Date(timestamp._seconds * 1000); // ← konversi dari API
        } else {
          dateObj = new Date(timestamp); // fallback
        }

        const date = dayjs(dateObj);

        let key = "";
        if (filter === "minggu") key = date.format("YYYY-MM-DD");
        else if (filter === "bulan") key = date.format("YYYY-MM");
        else if (filter === "tahun") key = date.format("YYYY");

        if (!grouped[key]) return;

        if (status === "hadir" && item.late === true) {
          grouped[key].terlambat++;
        } else if (grouped[key][status] !== undefined) {
          grouped[key][status]++;
        }
      });

      const datasets = [
        {
          label: "Hadir",
          data: labels.map((key) => grouped[key]?.hadir || 0),
          backgroundColor: "#4CAF50",
        },
        {
          label: "Izin",
          data: labels.map((key) => grouped[key]?.izin || 0),
          backgroundColor: "#2196F3",
        },
        {
          label: "Sakit",
          data: labels.map((key) => grouped[key]?.sakit || 0),
          backgroundColor: "#FF9800",
        },
        {
          label: "Alfa",
          data: labels.map((key) => grouped[key]?.alfa || 0),
          backgroundColor: "#F44336",
        },
        {
          label: "Terlambat",
          data: labels.map((key) => grouped[key]?.terlambat || 0),
          backgroundColor: "#9C27B0",
        },
      ];

      setChartData({ labels, datasets });
    };

    if (dataFromApi) {
      // Gunakan data dari props API
      processData(dataFromApi);
    } else {
      // Gunakan realtime Firestore
      unsubscribe = onSnapshot(collection(firestore, "absensi"), (snapshot) => {
        const rawData = snapshot.docs.map((doc) => doc.data());
        processData(rawData);
      });
    }

    return () => unsubscribe?.();
  }, [filter, dataFromApi]);

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { stacked: true },
      y: { stacked: true, beginAtZero: true },
    },
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {chartData ? <Bar data={chartData} options={options} /> : "Loading..."}
    </div>
  );
}
