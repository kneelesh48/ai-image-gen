import type { Provider } from './types';

export const providers: Provider[] = [
    {
      id: "pollinations",
      name: "Pollinations",
      models: [
        { id: "flux", name: "flux" },
        { id: "turbo", name: "turbo" },
      ],
    },
    {
      id: "together",
      name: "Together",
      models: [
        {
          id: "black-forest-labs/FLUX.1-schnell-Free",
          name: "FLUX.1-schnell-Free",
        },
      ],
    },
    {
      id: "xai",
      name: "xAI",
      models: [{ id: "grok-2-image", name: "grok-2-image" }],
    },
    {
      id: "google",
      name: "Google",
      models: [{ id: "gemini-2.0-flash-exp", name: "gemini-2.0-flash" }],
    },
  ];