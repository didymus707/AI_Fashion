"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { uploadToYouCam, startVirtualTryOn, checkTaskStatus } from "./actions";

type Product = {
  id: number;
  name: string;
  price: string | null;
  image: string | null;
  category:
    | "full_body"
    | "upper_body"
    | "lower_body"
    | "outerwear"
    | "shoes"
    | "auto";
  status: "in_stock" | "concept";
  tagline: string; // small subtitle on product card
  description: string;
};

// Our Updated Store Inventory
const INVENTORY: Product[] = [
  {
    id: 1,
    name: "Noir Print Dinner Gown",
    price: "£44.99",
    image: "/black-dress.jpg",
    category: "full_body",
    status: "in_stock",
    tagline: "In stock · Sourced from Lagos",
    description:
      "An elegant, form-fitting dress in a subtle black leopard print. Features a unique bodice cutout and a flattering draped waistline.",
  },
  {
    id: 2,
    name: "Monochrome Brushstroke Co-ord",
    price: "£43.99",
    image: "/wifey-design-1.jpg",
    category: "full_body",
    status: "in_stock",
    tagline: "In stock · Sourced from Lagos",
    description:
      "Make a bold statement with this striking two-piece matching set. Featuring a dramatic black-and-white abstract brushstroke print, this ensemble pairs a relaxed-fit, button-down shirt with flowing wide-leg trousers for an effortless, chic silhouette.",
  },
];

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product>(INVENTORY[0]);
  const [email, setEmail] = useState<string>("");
  const [notifyStatus, setNotifyStatus] = useState<string>("");
  const [notifySubmitted, setNotifySubmitted] = useState<boolean>(false);

  // File States
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);

  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  // Handle Photo Selections
  const handlePhotoSelect = (
    e: ChangeEvent<HTMLInputElement>,
    type: "model" | "garment",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "model") {
        setModelFile(file);
        setModelPreviewUrl(URL.createObjectURL(file));
      }
    }
  };

  const resetTryOn = () => {
    setFinalImageUrl(null);
    setStatus("");
    setNotifySubmitted(false);
    setNotifyStatus("");
    setEmail("");
  };

  const changeProduct = (product: Product) => {
    if (isLoading) return;
    setSelectedProduct(product);
    resetTryOn();
  };

  const handleNotify = () => {
    if (!email || !email.includes("@")) {
      setNotifyStatus("Please use a valid email address!");
      return;
    }

    setNotifyStatus(
      `Thanks, we'll be in touch about the ${selectedProduct.name}`,
    );
     setEmail("");
    setNotifySubmitted(true);
  };

  // The Master Try-On Function
  const runStorefrontTryOn = async () => {
    if (!modelFile) return;

    setIsLoading(true);
    setStatus("Preparing your custom fit...");

    try {
      const modelFormData = new FormData();
      modelFormData.append("image", modelFile);
      const modelUpload = await uploadToYouCam(modelFormData);
      if (!modelUpload.success || !modelUpload.fileId)
        throw new Error("Failed to upload your photo.");

      let garmentFileId = "";

      setStatus("Fetching designer garment...");
      const garmentResponse = await fetch(selectedProduct.image as string);
      const garmentBlob = await garmentResponse.blob();
      const garmentFile = new File([garmentBlob], "garment.jpg", {
        type: "image/jpeg",
      });
      const garmentFormData = new FormData();
      garmentFormData.append("image", garmentFile);
      const garmentUpload = await uploadToYouCam(garmentFormData);
      if (!garmentUpload.success || !garmentUpload.fileId)
        throw new Error("Failed to process garment.");
      garmentFileId = garmentUpload.fileId;

      setStatus("AI is tailoring your outfit (this takes 30-60 seconds)...");
      const task = await startVirtualTryOn(
        modelUpload.fileId,
        garmentFileId,
        selectedProduct.category,
      );

      if (task.success && task.taskId) {
        pollStatus(task.taskId);
      } else {
        throw new Error("Failed to start the AI tailor.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message || "An error occurred.");
      setIsLoading(false);
    }
  };

  const pollStatus = async (taskId: string) => {
    const check = await checkTaskStatus(taskId);
    if (!check.success) {
      setStatus(`Task Error: ${check.error}`);
      setIsLoading(false);
      return;
    }
    const currentStatus = check.taskStatus;
    if (currentStatus === "success" || currentStatus === "completed") {
      setFinalImageUrl(check.resultUrl);
      setStatus("Success! How does it look?");
      setIsLoading(false);
    } else if (currentStatus === "failed" || currentStatus === "error") {
      setStatus(
        "The AI failed to process this combination. Try a clearer photo.",
      );
      setIsLoading(false);
    } else {
      setTimeout(() => pollStatus(taskId), 3000);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFE] text-gray-900 font-sans pb-24 selection:bg-purple-200">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-purple-100 px-8 py-5 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="gap-6 text-sm font-medium text-gray-500 hidden md:flex">
          <a href="#" className="hover:text-purple-900 transition-colors">
            COLLECTIONS
          </a>
          <a href="#" className="text-purple-900 transition-colors">
            Muse & Stitch
          </a>
        </div>

        <h1 className="text-3xl font-serif font-bold tracking-tight text-purple-950 text-center flex-1 md:flex-none">
          Maison de Luxe
        </h1>

        <div className="w-16 hidden md:block" />
      </nav>

      {/* Main PDP Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Product Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative w-full aspect-3/4 bg-purple-50 rounded-md overflow-hidden flex items-center justify-center">
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
        <div className="lg:col-span-5 flex flex-col pt-4">
          <h2 className="text-3xl font-serif text-purple-950 mb-2">
            {selectedProduct.name}
          </h2>
          <p className="text-2xl font-medium text-purple-900 mb-6">
            {selectedProduct.price ?? "Made to order"}
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mb-8 pb-8 border-b border-purple-100">
            {selectedProduct.tagline}
          </p>

          <div className="bg-white p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-purple-50">
            {!finalImageUrl ? (
              <div className="space-y-6">
                <h3 className="text-lg font-serif text-purple-950 flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Virtual Muse & Stitch Try-On
                </h3>

                <div className="grid gap-4">
                  <div className="w-full aspect-3/4 border border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center overflow-hidden bg-purple-50/50 relative hover:bg-purple-50 transition-colors">
                    {modelPreviewUrl ? (
                      <img
                        src={modelPreviewUrl}
                        alt="Your Photo"
                        className="h-full object-cover"
                      />
                    ) : (
                      <div className="text-center text-purple-900/60 p-4">
                        <span className="block text-2xl mb-2">📸</span>
                        <p className="text-xs font-medium uppercase tracking-wider">
                          Your Photo
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoSelect(e, "model")}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                {status && (
                  <div className="text-sm font-medium text-center text-purple-900 bg-purple-100 p-3 rounded-md border border-purple-200">
                    {status}
                  </div>
                )}

                <button
                  onClick={runStorefrontTryOn}
                  disabled={!modelFile || isLoading}
                  className="w-full bg-purple-950 text-white py-4 rounded-md font-medium uppercase tracking-widest text-sm hover:bg-purple-900 transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed shadow-md shadow-purple-900/10"
                >
                  {isLoading ? "Processing..." : "Run Virtual Try-On"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-serif text-purple-950 text-center">
                  Your Bespoke Fit
                </h3>
                <div className="relative w-full aspect-3/4 rounded-md overflow-hidden shadow-sm border border-gray-100">
                  <Image
                    src={finalImageUrl}
                    alt="Final AI Generation"
                    fill
                    className="object-cover"
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                <div className="space-y-2">
                  {notifySubmitted ? (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-4 text-center">
                      <p className="text-sm font-medium text-purple-900">
                        You&apos;re on the list — we&apos;ll email you when{" "}
                        {selectedProduct.name} is available.
                      </p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full p-3 border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-900 focus:border-purple-900"
                      />
                      <button
                        onClick={handleNotify}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
                      >
                        {selectedProduct.status === "in_stock"
                          ? `Notify me — ${selectedProduct.price}`
                          : "Pre-Order Concept — Notify Me"}
                      </button>
                    </>
                  )}
                  {notifyStatus && !notifySubmitted && (
                    <p className="text-xs text-center text-purple-900 pt-2">
                      {notifyStatus}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => resetTryOn()}
                  className="w-full text-xs text-gray-400 hover:text-purple-900 underline mt-4 uppercase tracking-wider"
                >
                  Try Another Outfit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
