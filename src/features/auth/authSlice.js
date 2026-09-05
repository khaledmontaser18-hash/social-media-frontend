import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../config/axios";

// 1. طلب تسجيل الدخول من الباك-إند (AsyncThunk)
export const loginUser = createAsyncThunk("auth/loginUser", async (userData, thunkAPI) => {
  try {
    const response = await api.post("/auth/login", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token); // حفظ التوكن بالمتصفح
    }
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "خطأ في تسجيل الدخول");
  }
});

// 2. طلب إنشاء حساب جديد
export const registerUser = createAsyncThunk("auth/registerUser", async (userData, thunkAPI) => {
  try {
    const response = await api.post("/auth/register", userData);
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data?.message || "خطأ في إنشاء الحساب");
  }
});

// 3. جلب بيانات المستخدم المسجل حالياً باستخدام التوكن المحفوظ
export const getMe = createAsyncThunk("auth/getMe", async (_, thunkAPI) => {
  try {
    const response = await api.get("/auth/get-me");
    return response.data;
  } catch (error) {
    // إذا كان التوكن تالفاً أو منتهياً يتم حذفه تلقائياً
    localStorage.removeItem("token");
    return thunkAPI.rejectWithValue(error.response?.data?.message || "انتهت الجلسة");
  }
});

// 4. تحديث بيانات الملف الشخصي والصور
export const updateProfileData = createAsyncThunk(
  "auth/updateProfileData",
  async (formData, thunkAPI) => {
    try {
      const response = await api.put("/users/update-profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data.user; // يعيد بيانات المستخدم بعد تحديثها
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || "خطأ في تحديث البيانات");
    }
  }
);

// الحالة الابتدائية للمتحكم
const initialState = {
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // دالة تسجيل الخروج وتنظيف المتصفح
    logout: (state) => {
      localStorage.removeItem("token");
      state.user = null;
      state.token = null;
      state.error = null;
    },
    // مسح أخطاء التحقق لعدم تكرار عرضها في الواجهة
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // التعامل مع تسجيل الدخول
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // التعامل مع إنشاء الحساب
      .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      
      // التعامل مع جلب بيانات المستخدم الحالي
      .addCase(getMe.pending, (state) => { state.loading = true; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.user = null;
        state.token = null;
      })

      // 🚨 الإضافة المطلوبة: التعامل مع حالة تحديث البيانات لدمج الصور والـ Bio الجديد حياً بالـ State
      .addCase(updateProfileData.pending, (state) => { 
        state.loading = true; 
        state.error = null; 
      })
      .addCase(updateProfileData.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload; // تحديث بيانات المستخدم المخزنة بالبيانات الجديدة القادمة من الباك-إند
      })
      .addCase(updateProfileData.rejected, (state, action) => { 
        state.loading = false; 
        state.error = action.payload; 
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
