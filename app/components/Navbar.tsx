"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <nav className="w-full bg-white border-b border-purple-100 sticky top-0 z-50 shadow-sm">
      <div className="px-4 md:px-8 py-4 flex justify-between items-center">
        {/* Left Side: Mobile Hamburger OR Desktop Links */}
        <div className="flex-1 flex justify-start">
          <button
            className="md:hidden text-purple-950 focus:outline-none"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <Link
              href="/"
              className={`transition-colors ${pathname === "/" ? "text-purple-900 font-bold" : "text-gray-500 hover:text-purple-900"}`}
            >
              COLLECTIONS
            </Link>
            <Link
              href="/bespoke"
              className={`transition-colors ${pathname === "/bespoke" ? "text-purple-900 font-bold" : "text-gray-500 hover:text-purple-900"}`}
            >
              BESPOKE
            </Link>
          </div>
        </div>

        {/* Center: Logo */}
        <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-purple-950 text-center flex-none">
          Maison de Luxe
        </h1>

        <div className="flex-1" />
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-purple-50 absolute w-full left-0 shadow-lg pb-4">
          <div className="flex flex-col px-6 py-4 space-y-6 text-center font-serif text-lg text-purple-900">
            <Link
              href="/"
              className={`${pathname === "/" ? "font-bold" : "hover:text-purple-700"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Collections
            </Link>
            <Link
              href="/bespoke"
              className={`${pathname === "/bespoke" ? "font-bold" : "hover:text-purple-700"}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Bespoke
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
