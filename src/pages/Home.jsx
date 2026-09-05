import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, createPost, clearPosts } from "../features/posts/postSlice"; 
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

const Home = () => {
  const dispatch = useDispatch();
  const { posts, loading } = useSelector((state) => state.posts);
  const { user } = useSelector((state) => state.auth);

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(clearPosts());
    dispatch(fetchPosts({ page: 1, pageSize: 15 }));
  }, [dispatch]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !imageFile) return;

    setCreating(true);
    const formData = new FormData();
    formData.append("content", content.trim());
    formData.append("privacy", "public"); 
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await dispatch(createPost(formData)); 
    if (createPost.fulfilled.match(result)) {
      setContent("");
      setImageFile(null);
    }
    setCreating(false);
  };

  return (
    <div className="home-modern-view min-vh-100 text-start" style={{ direction: "ltr" }}>
      <Navbar />
      
      <div className="container py-4">
        <div className="row g-4">
          
          {user && (
            <div className="col-lg-4 d-none d-lg-block">
              <div className="card custom-bootstrap-card shadow-sm p-3 text-center sticky-top" style={{ top: "85px" }}>
                <img
                  src={user.profileImage || "https://placeholder.com"}
                  alt="profile"
                  className="rounded-circle border mx-auto mb-3"
                  style={{ width: "75px", height: "75px", objectFit: "cover" }}
                />
                <h5 className="fw-bold mb-1">{user.firstName} {user.lastName}</h5>
                <p className="text-muted small mb-3">@{user.username}</p>
                <div className="border-top pt-2 mt-2" style={{ textAlign: "initial" }}>
                  <small className="text-muted">{user.bio || "No bio available yet."}</small>
                </div>
              </div>
            </div>
          )}

          <div className="col-12 col-lg-8 mx-auto">
            
            {user && (
              <div className="card custom-bootstrap-card shadow-sm p-4 mb-4 border-0">
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={user.profileImage || "https://placeholder.com"}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: "42px", height: "42px", objectFit: "cover" }}
                  />
                  <h6 className="mb-0 fw-bold ms-3">What's on your mind, {user.firstName}?</h6>
                </div>

                <form onSubmit={handlePostSubmit}>
                  {/* 💡 تم إضافة dir="auto" لحل مشكلة اتجاه الكتابة العربي الفوري */}
                  <textarea
                    className="form-control glass-textarea mb-3 p-3"
                    rows="3"
                    placeholder="Share something interesting... / شارك شيئاً مثيراً للإعجاب..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    dir="auto" 
                    style={{ resize: "none" }}
                  ></textarea>

                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <label className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-0" style={{ cursor: "pointer" }}>
                      🖼️ Attach Photo
                      <input type="file" accept="image/*" className="d-none" onChange={(e) => setImageFile(e.target.files[0])} />
                    </label>

                    <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={creating}>
                      {creating ? "Publishing..." : "Post"}
                    </button>
                  </div>

                  {imageFile && (
                    <div className="mt-2 p-2 bg-dark bg-opacity-10 border rounded d-flex justify-content-between align-items-center" style={{ direction: "ltr" }}>
                      <small className="text-info">📎 Selected: {imageFile.name}</small>
                      <button type="button" className="btn-close" onClick={() => setImageFile(null)}></button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {loading && posts.length === 0 && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <p className="text-muted mt-2">Loading your feed...</p>
              </div>
            )}

            {!loading && posts.length === 0 ? (
              <div className="card custom-bootstrap-card text-center p-5 text-muted shadow-sm">
                📭 No posts available on your network right now.
              </div>
            ) : (
              posts.map((post) => (
                <div className="mb-3" key={post.id}>
                  <PostCard post={post} />
                </div>
              ))
            )}

          </div>

        </div>
      </div>
    </div>
  );
};

export default Home;
