import { io } from "socket.io-client";

// يكتشف تلقائياً هل الموقع يعمل حياً أونلاين أم محلياً على جهازك
const isProduction = window.location.hostname !== "localhost";

// 💡 حل الأزمة: ربط السوكت برابط سيرفر الـ Railway الفعلي والحقيقي أونلاين
const socket = io(isProduction 
  ? "https://social-media-backend-production-7d92.up.railway.app" 
  : "http://localhost:5000", 
  {
    autoConnect: false, // يظل false ويتم تشغيله ذكياً في App.jsx فور الدخول
    transports: ["websocket", "polling"],
    withCredentials: true, // دعم الـ Polling والـ Websocket معاً لضمان الاستقرار السحابي تماماً
  }
);

export default socket;
