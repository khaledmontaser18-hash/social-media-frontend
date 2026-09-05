import axios from "axios";
const isProduction = window.location.hostname !== "localhost";

const API = axios.create({
  baseURL: isProduction
    ? "https://social-media-backend-production-7d92.up.railway.app/api/v1" 
    : "http://localhost:5000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

export default API;
