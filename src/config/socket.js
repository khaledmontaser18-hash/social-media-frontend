import { io } from "socket.io-client";

// إنشاء اتصال مع سيرفر السوكت في الباك-إند
const socket = io("http://localhost:5000", {
  autoConnect: false, // نجعله false لنقوم بتشغيله يدوياً فور تأكيد هوية المستخدم
});

export default socket;
