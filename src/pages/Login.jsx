import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error, token } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });

  // التوجيه التلقائي للرئيسية عند نجاح تسجيل الدخول والتقاط التوكن
  useEffect(() => {
    if (token) {
      navigate("/");
    }
    return () => {
      dispatch(clearError());
    };
  }, [token, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) return;
    dispatch(loginUser(formData));
  };

  return (
    <div className="neon-wrapper min-vh-100 d-flex align-items-center justify-content-center px-3" style={{ direction: "rtl" }}>
      {/* جرم إضاءة نيون إضافي متحرك لزيادة الإشراق والسطوع الجمالي بالخلفية */}
      <div className="neon-glow-center"></div>

      <div className="glass-panel text-white p-5 w-100 shadow" style={{ maxWidth: "440px", borderRadius: "24px" }}>
        
        {/* عنوان الصفحة الرئيسي المتوهج */}
        <div className="text-center mb-5">
          <h1 className="fw-light display-5 tracking-wide mb-2" style={{ letterSpacing: "1px" }}>Login</h1>
        </div>

        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-20 text-white border-0 text-center py-2 mb-4" style={{ borderRadius: "10px" }}>
            {error}
          </div>
        )}

        {/* نموذج كتابة البيانات الزجاجي فائق التفاعل */}
        <form onSubmit={handleSubmit}>
          
          {/* حقل البريد الإلكتروني */}
          <div className="mb-4 position-relative">
            <input
              type="email"
              name="email"
              className="form-control glass-input text-center"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          {/* حقل كلمة المرور */}
          <div className="mb-5 position-relative">
            <input
              type="password"
              name="password"
              className="form-control glass-input text-center"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* زر تسجيل الدخول النيوني فائق التوهج والاهتزاز */}
          <button type="submit" className="btn w-100 glass-btn text-uppercase mb-4" disabled={loading}>
            {loading ? "Logging in..." : "LOGIN"}
          </button>

          {/* رابط إنشاء حساب مدمج بالأسفل للتوجيه */}
          <div className="text-center" style={{ fontSize: "13px" }}>
            <span className="text-white-50">Don't have an account? </span>
            <Link to="/register" className="text-white fw-bold text-decoration-none ms-1 hover-underline">Signup</Link>
          </div>

        </form>

      </div>
    </div>
  );
};

export default Login;
