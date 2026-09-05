import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // فحص وجود التوكن في المتصفح للحكم على حالة تسجيل الدخول
  const token = localStorage.getItem("token");

  // إذا لم يكن هناك توكن، يتم تحويله لصفحة الـ login، وإلا يتم السماح له بفتح الصفحة المطلوبة
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
