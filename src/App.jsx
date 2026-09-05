import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMe } from "./features/auth/authSlice";
import { addLiveNotification } from "./features/notifications/notificationsSlice";
import { addLiveMessage, clearChat, openChatWithParticipant } from "./features/chat/chatSlice"; 
import socket from "./config/socket";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PostDetailsPage from "./pages/PostDetailsPage"; // 💡 تم إضافة استيراد صفحة التفاصيل الجديدة
import ProtectedRoute from "./routes/ProtectedRoute";
import SearchResults from "./pages/SearchResults";
import ChatWindow from "./components/ChatWindow";

function App() {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const activeChatPartner = useSelector((state) => state.chat.activePartner);

  // 1. قراءة المظهر المفضل (Theme) عند الإقلاع
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // 2. جلب بيانات المستخدم الحالي باستخدام التوكن المحفوظ
  useEffect(() => {
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch, token]);

  // 3. إدارة الويب سوكت (Socket.io) للإشعارات والرسائل الحية بدون تكرار
  useEffect(() => {
    if (user && user.id) {
      socket.connect();
      socket.emit("join_room", user.id);

      socket.on("new_notification", (notification) => {
        dispatch(addLiveNotification(notification));
      });

      socket.on("receive_message", (message) => {
        console.log("Live Message Received!:", message);
        dispatch(addLiveMessage(message));
        
        const isChatWindowOpen = document.getElementById("chat-window-container");
        
        if (!isChatWindowOpen && message.sender) {
          dispatch(openChatWithParticipant(message.sender));
        }
      });
    }
    return () => {
      socket.off("new_notification");
      socket.off("receive_message");
      socket.disconnect();
         };
  }, [user, dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/search" element={<SearchResults />} />
          
          {/* 💡 المسار المضاف المسؤول عن استقبال واستعراض بوست فردي محدد */}
          <Route path="/posts/:id" element={<PostDetailsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {activeChatPartner && (
        <ChatWindow 
          participant={activeChatPartner} 
          onClose={() => dispatch(clearChat())} 
        />
      )}
    </Router>
  );
}

export default App;
