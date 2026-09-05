import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../config/axios";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

const PostDetailsPage = () => {
  const { id } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getSinglePostData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching single post details:", err);
        setError("عذراً، هذا المنشور غير موجود أو تم حذفه مسبقاً.");
      } finally {
        setLoading(false);
      }
    };
    if (id) getSinglePostData();
  }, [id]);

  return (
    /* 💡 تم ضبط الـ direction إلى ltr لحماية سلامة هيكل وعناصر الـ Navbar من الانعكاس */
    <div className="home-modern-view min-vh-100 text-start" style={{ direction: "ltr" }}>
      <Navbar />
      <div className="container py-5">
        <div className="row">
          <div className="col-12 col-md-8 col-lg-6 mx-auto">
            
            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Loading post details...</p>
              </div>
            )}
            
            {error && (
              <div className="alert alert-danger text-center shadow-sm" style={{ direction: "rtl" }}>
                {error}
              </div>
            )}
            
            {!loading && post && <PostCard post={post} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailsPage;
