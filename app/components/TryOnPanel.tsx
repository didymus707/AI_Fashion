import Image from "next/image";
import { useState, ChangeEvent } from "react";
import { checkTaskStatus, startVirtualTryOn, uploadToYouCam } from "../actions";
import { GarmentSource } from "../products/data";

type TryOnPanelProps = {
  productName: string;
  isLoading: boolean;
  productPrice: string | null;
  garmentSource: GarmentSource;
  onLoadingChange: (loading: boolean) => void;
};

const TryOnPanel = ({
  isLoading,
  productName,
  productPrice,
  garmentSource,
  onLoadingChange,
}: TryOnPanelProps) => {
  const [email, setEmail] = useState<string>("");
  const [notifyStatus, setNotifyStatus] = useState<string>("");
  const [notifySubmitted, setNotifySubmitted] = useState<boolean>(false);

  // File States
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [modelPreviewUrl, setModelPreviewUrl] = useState<string | null>(null);

  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [garmentPreviewUrl, setGarmentPreviewUrl] = useState<string | null>(
    null,
  );

  const [status, setStatus] = useState<string>("");
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  const handlePhotoSelect = (
    e: ChangeEvent<HTMLInputElement>,
    type: "model" | "garment",
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (type === "model") {
        setModelFile(file);
        setModelPreviewUrl(URL.createObjectURL(file));
      } else {
        setGarmentFile(file);
        setGarmentPreviewUrl(URL.createObjectURL(file));
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

  const handleNotify = () => {
    if (!email || !email.includes("@")) {
      setNotifyStatus("Please use a valid email address!");
      return;
    }

    setEmail("");
    setNotifySubmitted(true);
  };

  const fileData = async (file: File) => {
    const formData = new FormData();
    if (file) formData.append("image", file);
    const fileUpload = await uploadToYouCam(formData);
    if (!fileUpload.success || !fileUpload.fileId)
      throw new Error("Failed to upload your photo.");

    return fileUpload;
  };

  // The Master Try-On Function
  const runStorefrontTryOn = async () => {
    if (!modelFile) return;
    if (garmentSource.type === "upload" && !garmentFile) {
      setStatus("Please upload a design inspiration first.");
      return;
    }

    onLoadingChange(true);
    setStatus("Preparing your fit...");

    try {
      const modelUpload = await fileData(modelFile);

      // Get the garment file from URL or from user upload
      let garmentFileToUpload: File;
      if (garmentSource.type === "product") {
        setStatus("Fetching designer garment...");
        const response = await fetch(garmentSource.imageUrl);
        const blob = await response.blob();
        garmentFileToUpload = new File([blob], "garment.jpg", {
          type: "image/jpeg",
        });
      } else {
        setStatus("Preparing your inspiration...");
        garmentFileToUpload = garmentFile!;
      }

      const garmentUpload = await fileData(garmentFileToUpload);

      setStatus("AI is tailoring your outfit (this takes 30-60 seconds)...");
      const task = await startVirtualTryOn(
        modelUpload.fileId,
        garmentUpload.fileId,
        garmentSource.category,
      );

      if (task.success && task.taskId) {
        pollStatus(task.taskId);
      } else {
        throw new Error("Failed to start the AI tailor.");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message || "An error occurred.");
      onLoadingChange(false);
    }
  };

  const pollStatus = async (taskId: string) => {
    const check = await checkTaskStatus(taskId);
    if (!check.success) {
      setStatus(`Task Error: ${check.error}`);
      onLoadingChange(false);
      return;
    }
    const currentStatus = check.taskStatus;
    if (currentStatus === "success" || currentStatus === "completed") {
      setFinalImageUrl(check.resultUrl);
      setStatus("Success! How does it look?");
      onLoadingChange(false);
    } else if (currentStatus === "failed" || currentStatus === "error") {
      setStatus(
        "The AI failed to process this combination. Try a clearer photo.",
      );
      onLoadingChange(false);
    } else {
      setTimeout(() => pollStatus(taskId), 3000);
    }
  };

  return (
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

          {garmentSource.type === "upload" && (
            <div className="bg-purple-50/70 border border-purple-200 rounded-md p-4 text-xs text-purple-900/80 space-y-2">
              <p className="font-semibold uppercase tracking-wider text-purple-900">
                For best results
              </p>
              <ul className="space-y-1 list-disc list-inside marker:text-purple-400">
                <li>
                  Design inspiration: front-facing, single garment clearly
                  visible.
                </li>
                <li>
                  Your photo: face and shoulders visible, standing forward,
                  plain background.
                </li>
                <li>
                  Avoid group photos, obstructed clothing, or unusual poses.
                </li>
              </ul>
            </div>
          )}

          <div
            className={`grid gap-4 ${garmentSource.type === "upload" ? "grid-cols-2" : "grid-cols-1"}`}
          >
            <div className="w-full aspect-[3/4] border border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center overflow-hidden bg-purple-50/50 relative hover:bg-purple-50 transition-colors">
              {modelPreviewUrl ? (
                <Image
                  src={modelPreviewUrl}
                  alt="Your Photo"
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                  unoptimized
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

            {garmentSource.type === "upload" && (
              <div className="w-full aspect-[3/4] border border-dashed border-purple-200 rounded-lg flex flex-col items-center justify-center overflow-hidden bg-purple-50/50 relative hover:bg-purple-50 transition-colors">
                {garmentPreviewUrl ? (
                  <Image
                    src={garmentPreviewUrl}
                    alt="Design Inspiration"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="text-center text-purple-900/60 p-4">
                    <span className="block text-2xl mb-2">✨</span>
                    <p className="text-xs font-medium uppercase tracking-wider">
                      Design Inspiration
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handlePhotoSelect(e, "garment")}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>

          {garmentSource.type === "product" && (
            <p className="text-xs text-gray-500 text-center">
              Tip: front-facing photo of you with shoulders visible works best.
            </p>
          )}

          {status && (
            <div className="text-sm font-medium text-center text-purple-900 bg-purple-100 p-3 rounded-md border border-purple-200">
              {status}
            </div>
          )}

          <button
            onClick={runStorefrontTryOn}
            disabled={
              !modelFile ||
              (garmentSource.type === "upload" && !garmentFile) ||
              isLoading
            }
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
          <div className="relative w-full aspect-[3/4] rounded-md overflow-hidden shadow-sm border border-gray-100">
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
                  {productName} is available.
                </p>
              </div>
            ) : (
              <>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full p-3 text-sm border border-purple-200 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-900 focus:border-purple-900"
                />
                <button
                  onClick={handleNotify}
                  className="w-full bg-purple-950 text-white py-3 px-2 rounded-md text-xs md:text-sm font-medium uppercase tracking-wider hover:bg-purple-900 transition-colors shadow-sm"
                >
                  {productPrice
                    ? `Notify me — ${productPrice}`
                    : "Pre-Order Concept — Notify Me"}
                </button>
              </>
            )}
            {notifyStatus && !notifySubmitted && (
              <p className="text-xs text-center text-red-600 pt-2">
                {notifyStatus}
              </p>
            )}
          </div>

          <button
            onClick={() => resetTryOn()}
            className="w-full text-xs text-gray-400 hover:text-purple-900 underline mt-4 uppercase tracking-wider"
          >
            {garmentSource.type === "product"
              ? "Try Another Outfit"
              : "Try Another Design"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TryOnPanel;
