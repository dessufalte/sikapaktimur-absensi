import { useEffect, useState } from "react";
import { collection, onSnapshot, Timestamp } from "firebase/firestore";
import { firestore } from "@/app/lib/firebase";
import dayjs from "dayjs";

import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AbsensiPieChart({ filter, dataFromApi = null }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    let unsubscribe;

    const processData = (rawData) => {
      const now = dayjs();
      let startDate;

      if (filter === "minggu") {
        startDate = now.startOf("week").add(1, "day");
      } else if (filter === "bulan") {
        startDate = now.startOf("month");
      } else {
        startDate = now.startOf("year").subtract(9, "year");
      }

      const total = {
        hadir: 0,
        izin: 0,
        sakit: 0,
        alfa: 0,
        terlambat: 0,
      };

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

        if (date.isBefore(startDate)) return;

        if (status === "hadir" && item.late === true) {
          total.terlambat++;
        } else if (total[status] !== undefined) {
          total[status]++;
        }
      });

      setChartData({
        labels: ["Hadir", "Izin", "Sakit", "Alfa", "Terlambat"],
        datasets: [
          {
            label: "Total",
            data: [
              total.hadir,
              total.izin,
              total.sakit,
              total.alfa,
              total.terlambat,
            ],
            backgroundColor: [
              "#4CAF50", // Hadir
              "#2196F3", // Izin
              "#FF9800", // Sakit
              "#F44336", // Alfa
              "#9C27B0", // Terlambat
            ],
            borderWidth: 1,
          },
        ],
      });
    };

    if (dataFromApi) {
      processData(dataFromApi);
    } else {
      unsubscribe = onSnapshot(collection(firestore, "absensi"), (snapshot) => {
        const rawData = snapshot.docs.map((doc) => doc.data());
        processData(rawData);
      });
    }

    return () => unsubscribe?.();
  }, [filter, dataFromApi]);

  return (
    <div className="max-w-xl mx-auto p-4 max-h-[400px]">
      {chartData ? <Pie data={chartData} /> : "Loading..."}
    </div>
  );
}
