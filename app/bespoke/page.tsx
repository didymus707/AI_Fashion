"use client";

import { useState } from "react";
import TryOnPanel from "../components/TryOnPanel";

export default function BespokePage() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-[#FDFCFE] text-gray-900 font-sans pb-24 selection:bg-purple-200">
      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 md:px-8 mt-16 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-xs uppercase tracking-widest text-purple-900 font-medium">
            Muse & Stitch
          </p>
          <h2 className="text-4xl md:text-5xl font-serif text-purple-950">
            Bespoke
          </h2>
          <p className="text-gray-600 leading-relaxed max-w-lg mx-auto">
            Have a design in mind? Upload your inspiration — a screenshot, a
            photo, anything — and see how it looks on you. Our tailors in Ibadan
            will bring it to life.
          </p>
        </div>

        <TryOnPanel
          garmentSource={{ type: "upload", category: "full_body" }}
          productName="Your Bespoke Design"
          productPrice={null}
          isLoading={isLoading}
          onLoadingChange={setIsLoading}
        />
      </div>
    </main>
  );
}
