import { NextResponse } from 'next/server';

async function fetchImageAsBase64(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
        let errorBody = '';
        try {
            errorBody = await response.text();
        } catch { /* ignore */ } // No need for the error variable binding
        throw new Error(`Failed to fetch image from Pollinations: ${response.status} ${response.statusText}. ${errorBody}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      prompt,
      model = "flux", // Default model for pollinations
      seed = Date.now(),
      width = 1024,
      height = 1024,
      nologo = true,
      private_image = true,
      enhance = false,
      // 'n' and 'response_format' are not directly applicable here as Pollinations returns one image directly
    } = body;

    // Basic validation
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    console.log(`Generating image with Pollinations model: ${model}, prompt: "${prompt}"`);

    // --- Pollinations Logic ---
    const encodedPrompt = encodeURIComponent(prompt);
    const url = `https://pollinations.ai/p/${encodedPrompt}`;
    const params = new URLSearchParams({
        model: model,
        seed: String(seed),
        width: String(width),
        height: String(height),
        nologo: String(nologo),
        private: String(private_image), // Use the renamed variable
        enhance: String(enhance),
    });

    const fullUrl = `${url}?${params.toString()}`;
    console.log(`Fetching from Pollinations URL: ${fullUrl}`);

    // Pollinations returns the image directly. Fetch and encode as b64_json.
    const base64Image = await fetchImageAsBase64(fullUrl);
    // Return in a structure consistent with the other API (array of objects)
    return NextResponse.json({ data: [{ b64_json: base64Image }] });

  } catch (error: unknown) {
     console.error('Error calling Pollinations API:', error);
     let errorMessage = 'An unexpected error occurred';
     if (error instanceof Error) {
         errorMessage = error.message;
     }
     return NextResponse.json({ error: `Failed to generate image via Pollinations: ${errorMessage}` }, { status: 500 });
  }
}