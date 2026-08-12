"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { uploadToYouCam, startVirtualTryOn, checkTaskStatus } from "./actions";

// store inventory
const INVENTORY = [
  {
    id: 1,
    name: "Emerald Organza Mini",
    price: "£74.99",
    image: "/green-dress.jpg",
  },
  {
    id: 2,
    name: "Noir Leopard Drape",
    price: "£64.99",
    image: "/black-dress.jpg",
  },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState(INVENTORY[0]);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  // handle user photo
  const handlePhotoSelection = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setModelFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setStatus("Photo Selected!Ready to try on");
    }
  };

  // Trigger the AI try on
  const runStoreFrontTryOn = async () => {
    if (!modelFile) return;

    setIsLoading(true);
    setStatus("Preparing your custom fit...");

    try {
      const modelFormData = new FormData();
      modelFormData.append("image", modelFile);
      const modelUpload = await uploadToYouCam(modelFormData);

      if (!modelUpload.success || !modelUpload.fileId) {
        throw new Error("Failed to upload your photo");
      }

      // fetch the local product image and upload it silently
      setStatus("Fetching designer garment.. ");
      const garmentResponse = await fetch(selectedProduct.image);
      const garmentBlob = await garmentResponse.blob();
      const garmentFile = new File([garmentBlob], "garment.jpg", {
        type: "image/jpeg",
      });

      const garmentFormData = new FormData();
      garmentFormData.append("image", garmentFile);
      const garmentUpload = await uploadToYouCam(garmentFormData);

      if (!garmentUpload.success || !garmentUpload.fileId) {
        throw new Error("Failed to process the garment");
      }

      // start tryon
      setStatus("AI is tailoring your outfit (this takes 30-60 seconds)...");
      const task = await startVirtualTryOn(
        modelUpload.fileId,
        garmentUpload.fileId,
      );

      if (task.success && task.taskId) {
        pollStatus(task.taskId); // Start the polling loop
      } else {
        throw new Error("Failed to start the AI tailor");
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An error occured";
      setStatus(message);
      setIsLoading(false);
    }
  };

  // The Polling Loop
  const pollStatus = async (taskId: string) => {
    const check = await checkTaskStatus(taskId);

    if (!check.success) {
      setStatus(`Task Error: ${check.error}`);
      setIsLoading(false);
      return;
    }

    const currentStatus = check.taskStatus;

    if (
      currentStatus === "completed" ||
      currentStatus === "done" ||
      currentStatus === "success"
    ) {
      setFinalImageUrl(check.resultUrl);
      setStatus("Success! How does it look?");
      setIsLoading(false);
    } else if (currentStatus === "failed" || currentStatus === "error") {
      setStatus(
        "The AI failed to process this combination. Try a cleaner photo.",
      );
      setIsLoading(false);
    } else {
      // If still processing, wait 3 seconds and ask again!
      setStatus("AI is tailoring your outfit (processing)...");
      setTimeout(() => pollStatus(taskId), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900 font-sans pb-24">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-2xl font-serif font-bold tracking-tighter">
          Maison de Luxe
        </h1>
        <div className="text-sm font-medium tracking-wide">AI ATELIER</div>
      </nav>

      <div className="max-w-6xl mx-auto px-8 mt-12 grid grid-cols-1 md:grid-cols-2 gap-16">
        {/* Left Column: Product Gallery */}
        <div className="space-y-8">
          <div>
            <h2 className="text-3xl font-serif mb-2">{selectedProduct.name}</h2>
            <p className="text-xl text-gray-500 mb-6">
              {selectedProduct.price}
            </p>
          </div>

          {/* Main Product Image */}
          <div className="relative w-full aspect-3/4 bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200">
            <Image
              src={selectedProduct.image}
              alt={selectedProduct.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* Thumbnail Selector */}
          <div className="flex gap-4 overflow-x-auto py-2">
            {INVENTORY.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`relative w-24 h-32 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedProduct.id === product.id
                    ? "border-black shadow-md opacity-100"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Virtual Try-On Interface */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 h-fit sticky top-24">
          {!finalImageUrl ? (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">
                Try It On Virtually
              </h3>

              <div className="w-full aspect-3/4 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center overflow-hidden bg-gray-50 relative">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Your Photo"
                    className="h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-gray-500">
                    <svg
                      className="mx-auto h-12 w-12 mb-3 text-gray-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-sm font-medium">
                      Upload a full-body photo
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      For best results, face forward.
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelection}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {status && (
                <div className="text-sm font-medium text-center text-indigo-600 bg-indigo-50 p-3 rounded-lg">
                  {status}
                </div>
              )}

              <button
                onClick={runStoreFrontTryOn}
                disabled={!modelFile || isLoading}
                className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? "Processing..." : "Virtual Try-On"}
              </button>
            </div>
          ) : (
            <div className="space-y-6 text-center">
              <h3 className="text-2xl font-serif text-gray-800">
                Your Bespoke Fit
              </h3>
              <div className="relative w-full aspect-3/4 rounded-xl overflow-hidden shadow-md">
                <Image
                  src={finalImageUrl}
                  alt="Final AI Generation"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <button className="w-full bg-green-600 text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-200">
                Pre-Order Now - {selectedProduct.price}
              </button>
              <button
                onClick={() => setFinalImageUrl(null)}
                className="text-sm text-gray-500 hover:text-black underline mt-2"
              >
                Try Another Outfit
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
