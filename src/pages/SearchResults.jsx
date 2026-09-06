import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../config/axios";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query"); // التقاط الكلمة المفتاحية من الرابط

  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const executeSearch = async () => {
      if (!query) return;
      try {
        setLoading(true);
        const response = await api.get(`/search?query=${encodeURIComponent(query)}`);
        setResults(response.data);
        setError(null);
      } catch (err) {
        setError("Unable to retrieve search results at this time."); // تحويل رسالة الخطأ للإنجليزية لتناسب مظهر الموقع
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [query]);

  return (
    // 💡 تم الإصلاح: تحويل الاتجاه إلى ltr ومحاذاة النص لليسار لتطابق الموقع كله واعتدال جهة الاسم
    <div className="bg-light min-vh-100 text-start" style={{ direction: "ltr" }}>
      <Navbar />
      
      <div className="container py-4">
        {/* 💡 تحويل العناوين للغة الإنجليزية لتناسب المظهر العام */}
        <h4 className="fw-bold mb-4 text-dark text-start">🔍 Search results for: <span className="text-primary">"{query}"</span></h4>
        
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {!loading && (
          <div className="row">
            
            {/* القائمة اليسرى: استعراض الحسابات المكتشفة (أصبحت من اليسار بشكل صحيح) */}
            <div className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom text-start">👥 People ({results.users.length})</h5>
                {results.users.length === 0 ? (
                  <p className="text-muted text-center py-3 mb-0">No matching users found.</p>
                ) : (
                  results.users.map((user) => (
                    // 💡 تم إصلاح وتعديل الهوامش ms-3 لتباعد الاسم عن الصورة بشكل صحيح وسليم في الـ LTR
                    <Link to={`/profile/${user.id}`} key={user.id} className="d-flex align-items-center p-2 mb-2 bg-light rounded text-decoration-none text-dark transition-all hover-shadow">
                      <img
                        src={user.profileImage || "https://placeholder.com"}
                        alt="avatar"
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div className="ms-3 text-start">
                        <h6 className="mb-0 fw-bold">{user.firstName} {user.lastName}</h6>
                        <small className="text-muted">@{user.username}</small>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* القائمة اليمنى: استعراض المنشورات المطابقة للبحث */}
            <div className="col-md-8">
              <div className="px-1">
                <h5 className="fw-bold text-primary mb-3 text-start">📑 Matching Posts ({results.posts.length})</h5>
                {results.posts.length === 0 ? (
                  <div className="card text-center p-5 shadow-sm text-muted">
                    📑 No posts found containing these keywords.
                  </div>
                ) : (
                  results.posts.map((post) => <PostCard key={post.id} post={post} />)
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
