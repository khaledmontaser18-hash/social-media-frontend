import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";
import { fetchPosts } from "../posts/postSlice";

// 1. إضافة تعليق جديد أو رد على تعليق
export const createComment = createAsyncThunk(
  "comments/createComment",
  async (commentData, thunkAPI) => {
    try {
      const response = await api.post("/comments", commentData);
      
      // بعد إضافة التعليق بنجاح، يفضل إعادة تحديث المنشورات لتحديث عداد التعليقات
      // أو لتحديث الشاشة الحالية إذا لزم الأمر
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "خطأ في إضافة التعليق");
    }
  }
);

const initialState = {
  loading: false,
  error: null,
};

const commentsSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createComment.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(createComment.fulfilled, (state) => { state.loading = false; })
      .addCase(createComment.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});

export const { clearCommentError } = commentsSlice.actions;
export default commentsSlice.reducer;
