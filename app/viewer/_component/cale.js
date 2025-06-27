import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./calendar-cos.css"

export default function KalenderAbsensi() {
  const [value, setValue] = useState(new Date());

  return (
    <div className="w-full h-full flex justify-center items-center p-4">
      <div className="max-w-sm w-full">
        <Calendar
          onChange={setValue}
          value={value}
          locale="id-ID"
          className="rounded-lg shadow-none border-0 custom-calendar"
        />
      </div>
    </div>
  );
}
