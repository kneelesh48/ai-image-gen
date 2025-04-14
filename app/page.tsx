"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { Wand2 } from "lucide-react";

import type { ApiRequestBody } from "./components/parameters/types";
import ParametersForm from "./components/ParametersForm";
import GeneratedImages from "./components/GeneratedImages";

const ImageGeneratorPage: NextPage = () => {
  const [n, setN] = useState<number>(1);

  const [generatedImages, setGeneratedImages] = useState<({ url: string } | { b64_json: string })[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<number | null>(null);


  const handleGenerate = async (providerId: string, requestBody: ApiRequestBody) => {
    setIsLoading(true);
    setError(null);
    setGeneratedImages([]);
    setGenerationTime(null);
    const startTime = performance.now();

    let apiUrl = "";
    if (providerId === "xai") {
      apiUrl = "/api/generate/xai";
    } else if (providerId === "pollinations") {
      apiUrl = "/api/generate/pollinations";
    } else if (providerId === "together") {
      apiUrl = "/api/generate/together";
    } else if (providerId === "google") {
      apiUrl = "/api/generate/google";
    } else {
      setError(`Unsupported provider selected: ${providerId}`);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `API error! status: ${response.status}`);
      }

      // Process Response
      if (data.data && Array.isArray(data.data)) {
        setGeneratedImages(data.data);
      } else if (providerId === "together" && data.base64Json) {
        setGeneratedImages([{ b64_json: data.base64Json }]);
      } else if (providerId === "together" && data.imageUrl) {
        setGeneratedImages([{ url: data.imageUrl }]);
      } else if (providerId === "google" && data.images) {
        const formattedImages = data.images.map((img: { base64Data: string }) => ({
          b64_json: img.base64Data
        }));
        setGeneratedImages(formattedImages);
      } else {
        console.warn("API response did not contain expected data format:", data);
        setGeneratedImages([]);
      }
    } catch (err: unknown) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? `Generation failed: ${err.message}` : "An unknown error occurred.");
      setGeneratedImages([]);
    } finally {
      const endTime = performance.now();
      const durationInSeconds = (endTime - startTime) / 1000;
      setGenerationTime(parseFloat(durationInSeconds.toFixed(2)));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900">
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl flex items-center justify-center gap-3">
            <Wand2 className="w-10 h-10 text-indigo-600" />
            AI Image Generator
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column: Parameters */}
          <ParametersForm
             isLoading={isLoading}
             onGenerate={handleGenerate}
             n={n}
             setN={setN}
          />

          {/* Right Column: Generated Images */}
          <GeneratedImages
            isLoading={isLoading}
            error={error}
            generatedImages={generatedImages}
            generationTime={generationTime}
            n={n}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGeneratorPage;
