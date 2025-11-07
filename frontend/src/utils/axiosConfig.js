import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  credentials: "include", // Always send cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;

