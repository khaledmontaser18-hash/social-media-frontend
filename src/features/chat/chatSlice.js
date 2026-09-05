import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";

// 1. جلب الرسائل المتبادلة بين المستخدم الحالي ومستخدم آخر
export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (participantId, thunkAPI) => {
    try {
      const response = await api.get(`/chat/messages/${participantId}`);
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error fetching messages");
    }
  }
);

// 2. إرسال رسالة جديدة للباك-إند
export const sendMessageData = createAsyncThunk(
  "chat/sendMessageData",
  async (messageData, thunkAPI) => {
    try {
      const response = await api.post("/chat/send", messageData);
      return response.data; 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "Error sending message");
    }
  }
);

const initialState = {
  messages: [],
  activePartner: null, // الحقل المسؤول عن حفظ المستخدم المفتوح معه الشات حالياً
  loading: false,
  error: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    // فتح صندوق المحادثة عند الضغط على زر مراسلة
    openChatWithParticipant: (state, action) => {
      state.activePartner = action.payload;
    },
    // 💡 تم إصلاح الدالة: تحديث مصفوفة الرسائل بمرجع ذاكرة جديد تماماً لفرض الرندرة اللحظية أونلاين
    addLiveMessage: (state, action) => {
      const messageExists = state.messages.some((m) => m.id === action.payload.id);
      if (!messageExists) {
        state.messages = [...state.messages, action.payload];
      }
    },
    // تنظيف المحادثة وغلق الصندوق
    clearChat: (state) => {
      state.messages = [];
      state.activePartner = null; 
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      // 💡 تم إصلاح الإرسال أيضاً: إنشاء مصفوفة جديدة تماماً لضمان نزول الرسالة التي أرسلتها أنت فوراً
      .addCase(sendMessageData.fulfilled, (state, action) => {
        state.messages = [...state.messages, action.payload];
      });
  },
});

export const { openChatWithParticipant, addLiveMessage, clearChat } = chatSlice.actions;
export default chatSlice.reducer;
