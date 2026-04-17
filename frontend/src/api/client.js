import axios from "axios";

function inferApiBaseUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) return envUrl;

  const host = window.location.hostname || "localhost";
  return `http://${host}:5000`;
}

export const api = axios.create({
  baseURL: inferApiBaseUrl(),
  withCredentials: true,
});

