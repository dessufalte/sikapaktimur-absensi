// components/CardStatistik.jsx
import { FaUser, FaCalendarCheck, FaClock, FaCalendarDay, FaFileAlt, FaCheck } from "react-icons/fa";

const iconMap = {
  user: <FaUser className="text-2xl text-emerald-600" />,
  hadir: <FaCalendarCheck className="text-2xl text-emerald-600" />,
  terlambat: <FaClock className="text-2xl text-emerald-600" />,
  hariKerja: <FaCalendarDay className="text-2xl text-emerald-600" />,
  potensi: <FaFileAlt className="text-2xl text-emerald-600" />,
  persentase: <FaCheck className="text-2xl text-emerald-600" />,
};

export default function CardStatistik({ title, value, icon }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl shadow-md bg-white">
      <div className="p-3 bg-emerald-100 rounded-full">{iconMap[icon]}</div>
      <div>
        <h1 className="text-md font-semibold text-gray-700">{title}</h1>
        <p className="text-xl font-bold text-emerald-600">{value}</p>
      </div>
    </div>
  );
}
