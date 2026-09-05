import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  // التحقق من وجود التوكن في الـ LocalStorage
  const token = localStorage.getItem("token");

  // إذا لم يكن هناك توكن، يتم تحويله لصفحة تسجيل الدخول، وإلا يتم السماح له بالدخول
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
