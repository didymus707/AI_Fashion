"use client";

import { useState } from "react";
import Image from "next/image";
import { INVENTORY, Product } from "./products/data";
import TryOnPanel from "./components/TryOnPanel";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(INVENTORY[0]);

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const changeProduct = (product: Product) => {
    if (isLoading) return;
    setSelectedProduct(product);
  };

  return (
    <main className="min-h-screen bg-[#FDFCFE] text-gray-900 font-sans pb-24 selection:bg-purple-200">
      {/* Main PDP Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Product Gallery */}
        <div className="space-y-6">
          <div className="relative w-full aspect-[3/4] bg-purple-50 rounded-md overflow-hidden flex items-center justify-center">
            <Image
              src={selectedProduct.image as string}
              alt={selectedProduct.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>

          {/* Thumbnail Selector */}
          <div className="flex gap-4 overflow-x-auto py-2 hide-scrollbar">
            {INVENTORY.map((product) => (
              <button
                key={product.id}
                disabled={isLoading}
                onClick={() => changeProduct(product)}
                className={`relative shrink-0 w-24 h-32 rounded-sm overflow-hidden border flex items-center justify-center transition-all ${isLoading && "cursor-not-allowed"} ${
                  selectedProduct.id === product.id
                    ? "border-purple-900 shadow-sm opacity-100 ring-1 ring-purple-900"
                    : "border-gray-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={product.image as string}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Details & Try-On */}
        <div className="flex flex-col pt-4">
          <h2 className="text-3xl font-serif text-purple-950 mb-2">
            {selectedProduct.name}
          </h2>
          <p className="text-2xl font-medium text-purple-900 mb-6">
            {selectedProduct.price ?? "Made to order"}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-8 pb-8 border-b border-purple-100">
            {selectedProduct.tagline}
          </p>

          <TryOnPanel
            key={selectedProduct.id}
            garmentSource={{
              type: "product",
              imageUrl: selectedProduct.image!,
              category: selectedProduct.category,
            }}
            productName={selectedProduct.name}
            productPrice={selectedProduct.price}
            isLoading={isLoading}
            onLoadingChange={setIsLoading}
          />
        </div>
      </div>
    </main>
  );
}
