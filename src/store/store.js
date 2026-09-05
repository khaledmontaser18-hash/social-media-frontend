import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import postsReducer from "../features/posts/postSlice";
import notificationsReducer from "../features/notifications/notificationsSlice";
import commentsReducer from "../features/comments/commentsSlice";
import chatReducer from "../features/chat/chatSlice";




export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postsReducer,
    notifications: notificationsReducer,
    comments: commentsReducer,
    chat: chatReducer
    
    // ربط متحكم تسجيل الدخول بالمخزن الرئيسي
  },
});

export default store;