import axios from "axios";
const isProduction = window.location.hostname !== "localhost";

const API = axios.create({
  baseURL: isProduction
    ? "https://railway.app" // 💡 تم إضافة https:// في البداية بأمان
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
