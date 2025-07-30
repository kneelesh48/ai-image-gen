"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageIcon, Loader2, Clock } from "lucide-react";
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

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
  const [selectedImage, setSelectedImage] = useState<{url?: string; b64_json?: string} | null>(null);

  const getImageSrc = (imgData: {url?: string; b64_json?: string}) => {
    if (imgData.url) return imgData.url;
    if (imgData.b64_json) return `data:image/png;base64,${imgData.b64_json}`;
    return null;
  };

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
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className={`grid gap-6 ${n > 1 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
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
          generatedImages.map((imgData, index) => {
            const imageSrc = getImageSrc(imgData);
            return (
              <Dialog key={index} open={selectedImage === imgData} onOpenChange={(open) => !open && setSelectedImage(null)}>
                <div
                  className="aspect-square bg-gray-200 rounded-lg overflow-hidden shadow-md border border-gray-300 relative group cursor-pointer hover:shadow-lg transition-shadow"
                >
                    {imageSrc ? (
                      <>
                        <a 
                          href={imageSrc} 
                          className="block w-full h-full"
                          onClick={(e) => {
                            e.preventDefault();
                            setSelectedImage(imgData);
                          }}
                        >
                          <Image
                            src={imageSrc}
                            alt={`Generated image ${index + 1}`}
                            fill
                            className="w-full h-full object-contain"
                          />
                        </a>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Invalid image data
                      </div>
                    )}
                    <a
                      href={imageSrc || "#"}
                      download={`generated_image_${index + 1}.png`}
                      className="absolute bottom-2 right-2 bg-indigo-600 text-white hover:bg-indigo-700 p-2 rounded-full transition-colors shadow-lg opacity-0 group-hover:opacity-100"
                      title="Download Image"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
                      </svg>
                    </a>
                  </div>
                <DialogContent className="max-w-fit max-h-fit w-fit h-fit p-0 border-0">
                  <DialogTitle className="sr-only">
                    Generated image {index + 1} - Full view
                  </DialogTitle>
                  {imageSrc && (
                    <Image
                      src={imageSrc}
                      alt={`Generated image ${index + 1} - Full view`}
                      width={1024}
                      height={1024}
                      className="max-w-[90vw] max-h-[90vh] w-auto h-auto object-contain block"
                      quality={100}
                    />
                  )}
                </DialogContent>
                </Dialog>
            );
          })
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