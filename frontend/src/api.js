/**
 * api.js
 * ------
 * Reusable network service layer for NovaAI Frontend.
 * Combines configuration from Vite environment variables.
 */

// Read config with default fallback to avoid crashes if environment variables are unset
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Sends a satellite image to the backend production endpoint (/api/analyze)
 * for analysis.
 *
 * @param {File} file - The image file selected by the user.
 * @returns {Promise<Object>} The AnalysisResponse object.
 * @throws {Error} Descriptive user-friendly error message block.
 */
export async function analyzeImage(file) {
    if (!file) {
        throw new Error("No image file provided.");
    }

    const formData = new FormData();
    // The backend expects UploadFile field named "image" (FastAPI contract)
    formData.append("image", file);

    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/analyze`;

    try {
        const response = await fetch(url, {
            method: "POST",
            body: formData,
            // Fetch handles Content-Type boundaries automatically when body is FormData
        });

        // 1. Identify common status codes with helpful explanations
        if (!response.ok) {
            let errorText = "";
            try {
                const errData = await response.json();
                errorText = errData.detail || errData.message || "";
            } catch {
                // response is not json
            }

            const errorMsg = errorText ? `: ${errorText}` : "";

            if (response.status === 400) {
                throw new Error(`Invalid request${errorMsg}`);
            } else if (response.status === 413) {
                throw new Error("Image file is too large (max limit is 20MB).");
            } else if (response.status === 422) {
                throw new Error(`Data validation issue on backend${errorMsg}`);
            } else if (response.status === 500) {
                throw new Error("Server-side error occurred during classification. Please check logs.");
            } else {
                throw new Error(`HTTP Error ${response.status}${errorMsg}`);
            }
        }

        // 2. Parse payload
        return await response.json();

    } catch (err) {
        // Fallback for network timeouts or browser connection drops
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            throw new Error("Could not connect to NovaAI backend. Please verify that the API server is running.");
        }
        throw err;
    }
}
