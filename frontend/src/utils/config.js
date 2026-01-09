// If we are in production, use the Render Backend URL. In dev, use localhost.
export const BASE_URL = import.meta.env.MODE === "development" 
    ? "http://localhost:8000" 
    : "https://YOUR-PROJECT-NAME.onrender.com"; // TODO: Update this URL after deploying