import axios from "axios";

// Create axios instance
export const base44 = axios.create({
  baseURL: "http://localhost:5000/api", // your backend URL
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
