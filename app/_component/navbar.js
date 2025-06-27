"use client";

import { useState } from "react";
import {
  FaHome,
  FaFolderOpen,
  FaInfoCircle,
  FaChevronDown,
  FaEye,
  FaPlus,
  FaCog,
} from "react-icons/fa";

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleDropdownClick = (href) => {
    setDropdownOpen(false);
    window.location.href = href;
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-emerald-500 shadow text-white">
      <div className="flex items-center gap-6">
        <a
          href="/"
          className="hover:underline font-semibold flex items-center gap-2"
        >
          <FaHome /> Home
        </a>
        <div className="relative">
          <button
            className="flex items-center gap-1 font-semibold focus:outline-none"
            onClick={() => setDropdownOpen((open) => !open)}
            onBlur={() => setDropdownOpen(false)}
            tabIndex={0}
            type="button"
          >
            <FaFolderOpen className="mr-1" /> Administrasi <FaChevronDown />
          </button>
          <div
            className={`absolute left-0 mt-2 w-40 bg-white text-emerald-400 font-bold rounded shadow-lg z-10 transition-opacity ${
              dropdownOpen
                ? "opacity-100 pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
          >
            <div
              className="px-4 py-2 hover:bg-emerald-300 hover:text-white flex items-center gap-2 cursor-pointer"
              tabIndex={dropdownOpen ? 0 : -1}
              onMouseDown={() => handleDropdownClick("/adder")}
            >
              <FaPlus /> Tambah Data
            </div>
            <div
              className="px-4 py-2 hover:bg-emerald-300 hover:text-white flex items-center gap-2 cursor-pointer"
              tabIndex={dropdownOpen ? 0 : -1}
              onMouseDown={() => handleDropdownClick("/viewer")}
            >
              <FaEye /> Monitoring
            </div>
          </div>
        </div>
        <a
          href="/about"
          className="hover:underline font-semibold flex items-center gap-2"
        >
          <FaInfoCircle /> About
        </a>
      </div>
      <a
        href="/settings"
        className="hover:underline font-semibold flex items-center gap-2"
      >
        <FaCog /> Settings
      </a>
    </nav>
  );
}
