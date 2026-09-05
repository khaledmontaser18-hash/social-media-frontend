import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";

// 1. جلب كافة المنشورات مع التغذية الإخبارية
export const fetchPosts = createAsyncThunk("posts/fetchPosts", async (params, thunkAPI) => {
  try {
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const response = await api.get(`/posts?page=${page}&pageSize=${pageSize}`);
    return response.data; // يعيد { page, pageSize, total, posts }
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Error fetching posts");
  }
});

// 2. إنشاء منشور جديد
export const createPost = createAsyncThunk("posts/createPost", async (postData, thunkAPI) => {
  try {
    const response = await api.post("/posts", postData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data.post;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Error creating post");
  }
});

// 3. التفاعل مع المنشور بالإعجاب (Toggle Like)
export const toggleLikePost = createAsyncThunk("posts/toggleLikePost", async (postId, thunkAPI) => {
  try {
    const response = await api.post("/likes/toggle", { postId, type: "like" });
    return { postId, message: response.data.message };
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Error toggling like");
  }
});

// 4. حذف منشور معين (تم تصحيح استقبال وحذف الهوية برمجياً)
export const deletePost = createAsyncThunk("posts/deletePost", async (postId, thunkAPI) => {
  try {
    await api.delete(`/posts/${postId}`);
    return postId; // إرجاع المعرف لفلترة المصفوفة
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "Error deleting post");
  }
});

const initialState = {
  posts: [],
  page: 1,
  hasMore: true,
  loading: false,
  error: null,
};

const postsSlice = createSlice({
  name: "posts",
  initialState,
  reducers: {
    clearPostsError: (state) => { state.error = null; },
    clearPosts: (state) => {
      state.posts = [];
      state.page = 1;
      state.hasMore = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => { state.loading = true; })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        const incomingPage = action.payload.page;
        if (incomingPage === 1) {
          state.posts = action.payload.posts;
        } else {
          const existingIds = new Set(state.posts.map(p => p.id));
          const uniqueIncoming = action.payload.posts.filter(p => !existingIds.has(p.id));
          state.posts = [...state.posts, ...uniqueIncoming];
        }
        state.page = incomingPage;
        state.hasMore = state.posts.length < action.payload.total;
      })
      .addCase(fetchPosts.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      .addCase(createPost.fulfilled, (state, action) => {
        const exists = state.posts.some(p => p.id === action.payload.id);
        if (!exists) {
          state.posts.unshift(action.payload);
        }
      })
      
      .addCase(toggleLikePost.fulfilled, (state, action) => {
        const { postId, message } = action.payload;
        const existingPost = state.posts.find((p) => p.id === postId);
        if (existingPost) {
          if (message === "Like added") {
            existingPost.likesCount += 1;
          } else if (message === "Like removed" && existingPost.likesCount > 0) {
            existingPost.likesCount -= 1;
          }
        }
      })
      
      // 💡 حل مشكلة الاختفاء الحركي الفوري عند الحذف
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter((p) => p.id !== action.payload);
      });
  },
});

export const { clearPostsError, clearPosts } = postsSlice.actions;
export default postsSlice.reducer;
