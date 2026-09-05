import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import NotificationsDropdown from "./NotificationsDropdown";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { user } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  
  // 💡 حالة برمجية لإدارة إطلاق حركة لوجو الموقع
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
  };

  // 💡 كود ذكي: لتشغيل موجة الحروف تلقائياً مرة واحدة كل 10 ثوانٍ لتعطي روح للموقع بهدوء
  useEffect(() => {
    const interval = setInterval(() => {
      triggerLogoAnimation();
    }, 10000); // 10 ثوانٍ
    return () => clearInterval(interval);
  }, []);

  const triggerLogoAnimation = () => {
    setIsLogoAnimating(true);
    // إزالة كلاس الحركة فور انتهاء الدوران (بعد 1.6 ثانية) لكي تصبح جاهزة للمرة القادمة
    setTimeout(() => {
      setIsLogoAnimating(false);
    }, 1600);
  };

  return (
    <nav className="navbar navbar-expand-lg glass-navbar sticky-top shadow-sm px-3">
      <div className="container-fluid d-flex align-items-center justify-content-between">
        
        {/* 💡 اللوجو المطور: يدعم الـ Hover تلقائياً بالـ CSS، وعند الضغط عليه كليك يلف فوراً، ويلف تلقائياً كل 10 ثوانٍ */}
       <div 
  className={`navbar-brand ${isLogoAnimating ? "animate" : ""}`} 
  style={{ cursor: "pointer" }} // يجعل الماوس يظهر كيد عند الوقوف عليه
  onClick={() => {
    triggerLogoAnimation(); // تشغيل حركة اللف أولاً
    navigate("/"); // الانتقال فوراً للصفحة الرئيسية حياً
  }}
>
          <span>C</span>
          <span>o</span>
          <span>n</span>
          <span>n</span>
          <span>e</span>
          <span>c</span>
          <span>t</span>
          <span style={{ color: "var(--neon-accent)", marginLeft: "2px" }}>+</span>
        </div>

        {/* صندوق البحث الزجاجي */}
        {user && (
          <form onSubmit={handleSearchSubmit} className="d-flex mx-auto" style={{ maxWidth: "360px", width: "100%" }}>
            <input
              type="text"
              className="form-control rounded-pill px-4 border-0"
              placeholder="Search people or posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                background: "rgba(255, 255, 255, 0.15)", 
                color: "#ffffff", 
                backdropFilter: "blur(10px)"
              }}
            />
          </form>
        )}

        {/* أزرار التحكم والـ Avatar مجمعة بأقصى اليمين */}
        <div className="d-flex align-items-center ms-auto">
          {user && (
            <div className="d-flex align-items-center me-2">
              
              <button 
                onClick={toggleTheme} 
                className="btn btn-sm rounded-circle p-2 me-2 border-0 d-flex align-items-center justify-content-center text-white"
                style={{ background: "rgba(255, 255, 255, 0.15)", width: "38px", height: "38px" }}
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                type="button"
              >
                {theme === "light" ? (
                  <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                  <svg xmlns="http://w3.org" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M6.34 17.66l-1.41 1.41"/><path d="M19.07 4.93l-1.41 1.41"/></svg>
                )}
              </button>

              <div className="me-3 d-flex align-items-center justify-content-center">
                <NotificationsDropdown />
              </div>

              <Link to={`/profile/${user.id}`} className="text-decoration-none d-flex align-items-center me-3 text-white">
                <img src={user.profileImage || "https://placeholder.com"} alt="avatar" className="rounded-circle border" style={{ width: "35px", height: "35px", objectFit: "cover", borderColor: "rgba(255,255,255,0.3)" }} />
                <span className="ms-2 fw-semibold d-none d-sm-inline text-white">{user.firstName}</span>
              </Link>
              
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-light btn-sm fw-bold rounded-pill px-3 shadow-sm" style={{ color: "#dc3545" }}>Logout</button>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
