"use client";

import React from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Clock } from "lucide-react";

// --- Props Interface ---
interface GeneratedImagesProps {
  isLoading: boolean;
  error: string | null;
  generatedImages: ({ url?: string;b64_json?: string })[];
  generationTime: number | null;
  n: number;
}

// --- Component ---
const GeneratedImages: React.FC<GeneratedImagesProps> = ({
  isLoading,
  error,
  generatedImages,
  generationTime,
  n,
}) => {
  return (
    <div className="lg:col-span-1">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-indigo-600" />
          Generated Images
        </h2>
        {generationTime !== null && !isLoading && (
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {generationTime}s
          </span>
        )}
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      <div
        className={`grid gap-6 ${
          n > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
        }`}
      >
        {isLoading ? (
          // Show placeholders based on the 'n' value being requested
          Array.from({ length: n }).map((_, index) => (
            <div
              key={`loading-${index}`}
              className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300"
            >
              <Loader2 className="w-12 h-12 text-gray-400 animate-spin" />
            </div>
          ))
        ) : generatedImages.length > 0 ? (
          generatedImages.map((imgData, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-md border border-gray-300 relative group"
            >
              {imgData.url ? (
                <Image
                  src={imgData.url}
                  alt={`Generated image ${index + 1}`}
                  fill
                  className="w-full h-full object-contain"
                />
              ) : imgData.b64_json ? (
                <Image
                  src={`data:image/png;base64,${imgData.b64_json}`}
                  alt={`Generated image ${index + 1}`}
                  fill
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  Invalid image data
                </div>
              )}
              <a
                href={
                  "url" in imgData
                    ? imgData.url
                    : `data:image/png;base64,${imgData.b64_json}`
                }
                download={`generated_image_${index + 1}.png`}
                className="absolute bottom-2 right-2 text-white hover:bg-indigo-700 p-2 rounded-full transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                title="Download Image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                </svg>
              </a>
            </div>
          ))
        ) : (
          // Show placeholder when no images are loaded and not loading
          <div
            className={`col-span-1 ${
              n > 1 ? "sm:col-span-2" : ""
            } aspect-square bg-white rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 text-center p-8`}
          >
            <ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800">
              No images generated yet
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Adjust parameters and click Generate Images to start.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeneratedImages;