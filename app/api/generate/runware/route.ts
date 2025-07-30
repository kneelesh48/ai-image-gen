import { NextRequest, NextResponse } from "next/server";
import { Runware } from "@runware/sdk-js";

export const maxDuration = 40;
export const runtime = "edge";

interface ILora {
  model: string;
  weight: number;
}

interface RunwareRequestBody {
  prompt: string;
  model: string;
  width?: number;
  height?: number;
  steps?: number;
  CFGScale?: number;
  seed?: number;
  negativePrompt?: string;
  numberResults?: number;
  outputType?: "URL" | "base64Data" | "dataURI";
  lora?: ILora[];
}

export async function POST(request: NextRequest) {
  try {
    const body: RunwareRequestBody = await request.json();

    const {
      prompt,
      model,
      width = 1024,
      height = 1024,
      steps = 40,
      CFGScale = 7,
      seed,
      negativePrompt,
      numberResults = 1,
      outputType = "URL",
      lora,
    } = body;

    if (!prompt || !model) {
      return NextResponse.json(
        { error: "Missing required parameters: prompt and model" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RUNWARE_API_KEY;
    if (!apiKey) {
      console.error("RUNWARE_API_KEY environment variable is not set");
      return NextResponse.json(
        { error: "Runware API key not configured" },
        { status: 500 }
      );
    }

    const runware = new Runware({ apiKey });

    const requestParams = {
      positivePrompt: prompt,
      model,
      width,
      height,
      steps,
      CFGScale,
      numberResults,
      outputType,
      ...(negativePrompt && { negativePrompt }),
      ...(seed && { seed }),
      ...(lora && lora.length > 0 && { lora }),
    };

    console.log("Runware request parameters:", requestParams);

    const images = await runware.requestImages(requestParams);

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: "No images generated" },
        { status: 500 }
      );
    }

    // Map the response to match the expected format
    interface RunwareImage {
      imageURL?: string;
      imageBase64Data?: string;
      imageDataURI?: string;
      taskUUID?: string;
      imageUUID?: string;
    }

    const responseImages = images.map((image: RunwareImage) => ({
      url: image.imageURL,
      base64: image.imageBase64Data,
      dataURI: image.imageDataURI,
      taskUUID: image.taskUUID,
      imageUUID: image.imageUUID,
    }));

    return NextResponse.json({
      success: true,
      images: responseImages,
      metadata: {
        provider: "runware",
        model,
        parameters: requestParams,
      },
    });
  } catch (error: unknown) {
    console.error("Runware API error:", error);

    let errorMessage = "Failed to generate image with Runware";
    let errorDetails = error;

    if (typeof error === "object" && error !== null) {
      if ("message" in error && typeof (error).message === "string") {
        errorMessage = (error).message;
      }
      if ("response" in error && typeof (error).response === "object" && (error).response !== null) {
        const responseObj = (error as { response?: { data?: unknown } }).response;
        errorDetails = responseObj && "data" in responseObj ? responseObj.data : error;
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details: errorDetails,
      },
      { status: 500 }
    );
  }
}
