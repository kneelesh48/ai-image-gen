import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const maxDuration = 40;
export const runtime = 'edge';

const openai = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = 'grok-2-image',
      n = 1,
      response_format = 'b64_json',
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    if (!process.env.XAI_API_KEY) {
        console.error('XAI_API_KEY is not set in environment variables.');
        return NextResponse.json({ error: 'API key not configured.' }, { status: 500 });
    }

    console.log(`Generating image with xAI model: ${model}, prompt: "${prompt}"`);

    const response = await openai.images.generate({
      model: model,
      prompt: prompt,
      n: n,
      response_format: response_format as 'url' | 'b64_json', // Cast to expected type
    });

    console.log('xAI API Response:', response);

    if (response.data && response.data.length > 0) {
        return NextResponse.json({ data: response.data });
    } else {
        console.error('No image data found in xAI response or response format is unexpected:', response);
        return NextResponse.json({ error: 'No image data received from API or invalid response format' }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error('Error calling xAI API:', error);
    let errorMessage = 'An unexpected error occurred';
    let errorStatus = 500;

    // Define a type for the expected error structure for better type checking
    type ApiError = {
      response?: {
        status?: number;
        data?: {
          error?: {
            message?: string;
          };
        };
      };
    } & Error; // Intersect with Error type

    if (typeof error === 'object' && error !== null) {
        // Check if it has a 'response' property that is an object
        if ('response' in error && typeof (error as ApiError).response === 'object' && (error as ApiError).response !== null) {
            const apiError = error as ApiError; // Assert type after checks
            const response = apiError.response;

            if (response && typeof response.status === 'number') {
                errorStatus = response.status;
            }

            // Check nested properties carefully
            if (response && typeof response.data === 'object' && response.data !== null &&
                'error' in response.data && typeof response.data.error === 'object' && response.data.error !== null &&
                'message' in response.data.error && typeof response.data.error.message === 'string')
            {
                errorMessage = response.data.error.message;
            } else if (apiError.message) {
                 // Fallback to the general error message if specific structure isn't found
                 errorMessage = apiError.message;
            }
        } else if (error instanceof Error) {
            // Handle standard Error objects
            errorMessage = error.message;
        }
    }
    // If it's not an object or doesn't fit known structures, keep the default message

    return NextResponse.json({ error: `Failed to generate image: ${errorMessage}` }, { status: errorStatus });
  }
}