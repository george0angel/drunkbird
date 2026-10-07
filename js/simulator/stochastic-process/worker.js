import { simulateProcess } from "./core.js";

self.addEventListener("message", (event) => {
  const { requestId, parameters } = event.data ?? {};

  try {
    const result = simulateProcess(parameters);

    self.postMessage({
      requestId,
      result,
    });
  } catch (error) {
    self.postMessage({
      requestId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
