"use client";

import { useState, ChangeEvent } from "react";
import Image from "next/image";
import { uploadToYouCam, startVirtualTryOn, checkTaskStatus } from "./actions";

export default function Home() {
  const [modelFileId, setModelFileId] = useState<string | null>(null);
  const [garmentFileId, setGarmentFileId] = useState<string | null>(null);

  const [status, setStatus] = useState<string>(
    "Step 1: Upload a photo of yourself.",
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [finalImageUrl, setFinalImageUrl] = useState<string | null>(null);

  // Reusable upload handler for both the person and the garment
  const handleUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    type: "model" | "garment",
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    setIsLoading(true);
    setStatus(`Uploading ${type}...`);

    try {
      const formData = new FormData();
      formData.append("image", e.target.files[0]);

      const data = await uploadToYouCam(formData);

      if (data.success && data.fileId) {
        if (type === "model") {
          setModelFileId(data.fileId);
          setStatus("Model uploaded! Step 2: Upload a garment image.");
        } else {
          setGarmentFileId(data.fileId);
          setStatus("Both images uploaded! Ready for Virtual Try-On.");
        }
      } else {
        setStatus(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      setStatus(`Failed to upload ${type}.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger the AI Task
  const runTryOn = async () => {
    if (!modelFileId || !garmentFileId) return;

    setIsLoading(true);
    setStatus("Initializing AI Virtual Try-On...");

    const data = await startVirtualTryOn(modelFileId, garmentFileId);

    if (data.success && data.taskId) {
      setStatus("AI is tailoring your outfit (this takes 30-60 seconds)...");
      pollStatus(data.taskId); // Start the polling loop
    } else {
      setStatus(`Error starting task: ${data.error}`);
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
      if (check.resultUrl) {
        setFinalImageUrl(check.resultUrl);
        setStatus("Success! Here is your bespoke AI design.");
      } else {
        setStatus("Task completed, but no image was returned");
      }
      setIsLoading(false);
    } else if (currentStatus === "failed" || currentStatus === 'error') {
      setStatus(
        "The AI failed to process these images. Try a different photo.",
      );
      setIsLoading(false);
    } else {
      // If still processing, wait 3 seconds and ask again!
      setStatus("AI is tailoring your outfit (processing)...");
      setTimeout(() => pollStatus(taskId), 3000);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Fashion MVP</h1>
          <p className="text-sm text-gray-500 mt-2">Virtual Try-On Engine</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Model Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">1. You</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "model")}
              className="block w-full text-xs text-gray-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
            {modelFileId && (
              <span className="text-xs text-green-600 font-bold">
                Uploaded ✓
              </span>
            )}
          </div>

          {/* Garment Upload */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">2. The Design</h3>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleUpload(e, "garment")}
              className="block w-full text-xs text-gray-500 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
            />
            {garmentFileId && (
              <span className="text-xs text-green-600 font-bold">
                Uploaded ✓
              </span>
            )}
          </div>
        </div>

        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            finalImageUrl
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {status}
        </div>

        {/* Generate Button */}
        {!finalImageUrl && (
          <button
            onClick={runTryOn}
            disabled={!modelFileId || !garmentFileId || isLoading}
            className="w-full bg-black text-white py-4 rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "Run Virtual Try-On"}
          </button>
        )}

        {/* The Final Result! */}
        {finalImageUrl && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold text-gray-800">Your Custom Fit</h2>
            <div className="relative w-full aspect-3/4 rounded-lg overflow-hidden shadow-md">
              <Image
                src={finalImageUrl}
                alt="AI Generated Outfit"
                fill
                className="object-cover"
                unoptimized // Bypasses local domain restrictions for external URLs
              />
            </div>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 underline"
            >
              Start Over
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
