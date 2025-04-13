interface Model {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  models: Model[];
}

interface BaseRequestBody {
  prompt: string;
  model: string | null;
}

interface XaiRequestBody extends BaseRequestBody {
  n: number;
  response_format: "url" | "b64_json";
}

interface PollinationsRequestBody extends BaseRequestBody {
  seed: number;
  width: number;
  height: number;
  nologo: boolean;
  private: boolean;
  enhance: boolean;
}

interface TogetherRequestBody extends BaseRequestBody {
  width: number;
  height: number;
  steps: number;
  n: number;
  response_format: "url" | "base64";
}

export type ApiRequestBody =
  | XaiRequestBody
  | PollinationsRequestBody
  | TogetherRequestBody;

  export type { Model, Provider, BaseRequestBody, XaiRequestBody, PollinationsRequestBody, TogetherRequestBody };