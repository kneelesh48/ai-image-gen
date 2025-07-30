import type { Provider } from "./types";

export const providers: Provider[] = [
  {
    id: "pollinations",
    name: "Pollinations",
    models: [
      { id: "flux", name: "flux" },
      { id: "turbo", name: "turbo" },
      { id: "kontext", name: "kontext" },
      { id: "gptimage", name: "gptimage" },
    ],
  },
  {
    id: "runware",
    name: "Runware",
    models: [
      { id: "runware:100@1", name: "FLUX.1 Schnell" },
      { id: "runware:101@1", name: "FLUX.1 Dev" },
      { id: "bfl:2@1", name: "FLUX.1.1 Pro" },
      { id: "bfl:2@2", name: "FLUX.1.1 Pro Ultra" },
      { id: "runware:106@1", name: "FLUX.1 Kontext Dev" },
      { id: "bfl:3@1", name: "FLUX.1 Kontext Pro" },
      { id: "bfl:4@1", name: "FLUX.1 Kontext Max" },
    ],
  },
  {
    id: "together",
    name: "Together",
    models: [
      {id: "black-forest-labs/FLUX.1-schnell-Free", name: "FLUX.1-schnell-Free"},
      {id: "black-forest-labs/FLUX.1-schnell", name: "FLUX.1-schnell"},
    ],
  },
  {
    id: "google",
    name: "Google",
    models: [{ id: "gemini-2.0-flash-exp", name: "gemini-2.0-flash" }],
  },
  {
    id: "xai",
    name: "xAI",
    models: [{ id: "grok-2-image", name: "grok-2-image" }],
  },
];
