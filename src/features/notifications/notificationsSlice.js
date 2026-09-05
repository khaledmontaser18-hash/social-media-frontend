import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";

// 1. جلب الإشعارات من الباك-إند
export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/notifications");
      return response.data.notifications; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error fetching notifications");
    }
  }
);

// 2. تحديث جميع الإشعارات لتصبح مقروءة
export const markNotificationsAsRead = createAsyncThunk(
  "notifications/markNotificationsAsRead",
  async (_, thunkAPI) => {
    try {
      const response = await api.patch("/notifications/mark-as-read");
      return response.data.message;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error updating notifications");
    }
  }
);

const initialState = {
  notifications: [],
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    // 💡 منع التكرار: يتم التحقق مما إذا كان المعرف موجوداً مسبقاً قبل ضخ الإشعار الحي
    addLiveNotification: (state, action) => {
      const exists = state.notifications.some((n) => n.id === action.payload.id);
      if (!exists) {
        state.notifications.unshift(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // فلترة البيانات القادمة من الأرشيف للتأكد من عدم وجود مكررات
        const uniqueNotifications = action.payload.filter(
          (notif, index, self) => self.findIndex((n) => n.id === notif.id) === index
        );
        state.notifications = uniqueNotifications;
      })
      .addCase(fetchNotifications.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(markNotificationsAsRead.fulfilled, (state) => {
        state.notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      });
  },
});

export const { addLiveNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer;
