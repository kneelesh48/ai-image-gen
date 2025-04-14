import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey });

interface ResponseData {
  images: Array<{
    mimeType: string|undefined;
    base64Data: string|undefined;
  }>;
  text: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const { 
      prompt,
      model = "gemini-2.0-flash-exp",
     } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Missing prompt in request body" },
        { status: 400 }
      );
    }

    console.log(prompt);

    const safetySettings = [
      {
        category: "HARM_CATEGORY_HARASSMENT",
        threshold: "BLOCK_NONE",
      },
      {
        category: "HARM_CATEGORY_HATE_SPEECH",
        threshold: "BLOCK_NONE",
      },
    ];
    
    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
      responseModalities: [
        "image",
        "text",
      ],
      responseMimeType: "text/plain",
      safetySettings: safetySettings,
    };
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: generationConfig,
    });

    const responseData: ResponseData = {
      images: [],
      text: "",
    };

    if (!response?.candidates?.[0]?.content?.parts) {
      console.error("No parts found in response.");
      return NextResponse.json({ error: "Empty response from Google Generative AI" }, { status: 500 });
    }

    for (const part of response?.candidates[0]?.content?.parts) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData) {
        responseData.images.push({
          mimeType: part.inlineData.mimeType,
          base64Data: part.inlineData.data,
        })
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error generating images:", error);
    return NextResponse.json(
      { error: "Failed to generate images" },
      { status: 500 }
    );
  }
}