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
        setError("تعذر الحصول على نتائج البحث حالياً.");
      } finally {
        setLoading(false);
      }
    };

    executeSearch();
  }, [query]);

  return (
    <div className="bg-light min-vh-100 text-end" style={{ direction: "rtl" }}>
      <Navbar />
      
      <div className="container py-4">
        <h4 className="fw-bold mb-4 text-dark text-start">🔍 نتائج البحث عن: <span className="text-primary">"{query}"</span></h4>
        
        {loading && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
          </div>
        )}

        {error && <div className="alert alert-danger text-center">{error}</div>}

        {!loading && (
          <div className="row">
            
            {/* القائمة اليمنى: استعراض الحسابات المكتشفة */}
            <div className="col-md-4 mb-4">
              <div className="card p-3 shadow-sm border-0" style={{ borderRadius: "12px" }}>
                <h5 className="fw-bold text-primary mb-3 pb-2 border-bottom text-start">👥 الأشخاص ({results.users.length})</h5>
                {results.users.length === 0 ? (
                  <p className="text-muted text-center py-3 mb-0">لم يتم العثور على مستخدمين مطابقتين.</p>
                ) : (
                  results.users.map((user) => (
                    <Link to={`/profile/${user.id}`} key={user.id} className="d-flex align-items-center p-2 mb-2 bg-light rounded text-decoration-none text-dark transition-all hover-shadow">
                      <img
                        src={user.profileImage || "https://placeholder.com"}
                        alt="avatar"
                        className="rounded-circle"
                        style={{ width: "40px", height: "40px", objectFit: "cover" }}
                      />
                      <div className="ms-2 me-3 text-start">
                        <h6 className="mb-0 fw-bold">{user.firstName} {user.lastName}</h6>
                        <small className="text-muted">@{user.username}</small>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* القائمة اليسرى: استعراض المنشورات المطابقة للبحث */}
            <div className="col-md-8">
              <div className="px-1">
                <h5 className="fw-bold text-primary mb-3 text-start">📑 المنشورات المطابقة ({results.posts.length})</h5>
                {results.posts.length === 0 ? (
                  <div className="card text-center p-5 shadow-sm text-muted">
                    📑 لم نجد أي منشور يحتوي على هذه الكلمات.
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
