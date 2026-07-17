type ErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  console.error("[NovaAI Error]", {
    message: errorObj.message,
    stack: errorObj.stack,
    route: typeof window !== "undefined" ? window.location.pathname : "unknown",
    ...context,
  });
}
