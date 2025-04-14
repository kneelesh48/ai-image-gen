import { NextRequest, NextResponse } from 'next/server';
import Together from 'together-ai';

export const maxDuration = 40;

const together = new Together({apiKey: process.env.TOGETHER_API_KEY});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    const {
      prompt,
      model = "black-forest-labs/FLUX.1-schnell-Free",
      width = 1024,
      height = 768,
      steps = 4,
      n = 1,
      response_format = "base64",
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log(`Generating image with prompt: ${prompt}, model: ${model}`);

    const response = await together.images.create({
      model: model,
      prompt: prompt,
      width: width,
      height: height,
      steps: steps,
      n: n,
      response_format: response_format as 'url' | 'base64',
    });

    console.log("Image generation successful.");

    // Assuming the response structure is correct and contains data
    if (response && response.data && response.data.length > 0 && response.data[0].b64_json) {
      const base64Json = response.data[0].b64_json;
      return NextResponse.json({ base64Json });
     }else if (response && response.data && response.data.length > 0 && response.data[0].url) {
      const imageUrl = response.data[0].url;
      return NextResponse.json({ imageUrl });
    } else {
      console.error("Unexpected response structure from Together AI:", response);
      return NextResponse.json({ error: 'Failed to generate image or unexpected response format' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating image with Together AI:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Failed to generate image', details: errorMessage }, { status: 500 });
  }
}