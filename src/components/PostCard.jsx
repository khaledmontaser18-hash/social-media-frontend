import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deletePost, toggleLikePost } from "../features/posts/postSlice";
import api from "../config/axios";

const PostCard = ({ post }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentsList, setCommentsList] = useState([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [postBody, setPostBody] = useState(post.content);
  const isMyPost = post.userId === currentUser?.id;

  const handleLikeToggle = async () => {
    try {
      const result = await dispatch(toggleLikePost(post.id));
      if (toggleLikePost.fulfilled.match(result)) {
        if (result.payload.message === "Like added") {
          setLikesCount(likesCount + 1);
        } else {
          setLikesCount(Math.max(0, likesCount - 1));
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCommentsView = async () => {
    if (!showComments) {
      try {
        const response = await api.get(`/posts/${post.id}`);
        setCommentsList(response.data.comments || []);
      } catch (err) {
        console.error(err);
      }
    }
    setShowComments(!showComments);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await api.post("/comments", { content: commentText.trim(), postId: post.id });
      setCommentsList([...commentsList, { id: response.data.id, content: response.data.content, createdAt: new Date(), author: currentUser }]);
      setCommentText("");
      setCommentsCount(commentsCount + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) return;
    try {
      await api.put(`/posts/${post.id}`, { content: editContent.trim() });
      setPostBody(editContent);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = () => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      dispatch(deletePost(post.id));
    }
  };

  const formatPostTime = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="card custom-bootstrap-card mb-4 border-0 p-3" style={{ direction: "ltr" }}>
      <div className="d-flex align-items-center justify-content-between mb-3 w-100">
        <div className="d-flex align-items-center">
          <img
            src={post.owner?.profileImage || "https://placeholder.com"}
            alt="avatar"
            className="rounded-circle border"
            style={{ width: "40px", height: "40px", objectFit: "cover" }}
          />
          <div className="ms-3 text-start">
            <h6 className="mb-0 fw-bold" style={{ fontSize: "14px" }}>
              {post.owner ? `${post.owner.firstName} ${post.owner.lastName}` : "User"}
            </h6>
            <small className="post-timestamp" style={{ fontSize: "11px" }}>{formatPostTime(post.createdAt)}</small>
          </div>
        </div>
        
        {isMyPost && (
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-link text-secondary p-1" onClick={() => setIsEditing(!isEditing)} title="Edit">✏️</button>
            <button className="btn btn-sm btn-link text-danger p-1" onClick={handleDeletePost} title="Delete">🗑️</button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="mb-3">
          {/* 💡 إعطاء ميزة dir="auto" أثناء تعديل البوست */}
          <textarea className="form-control comment-box-custom mb-2" dir="auto" value={editContent} onChange={(e) => setEditContent(e.target.value)} />
          <button className="btn btn-sm btn-primary rounded-pill me-2" onClick={handleUpdatePost}>Save</button>
          <button className="btn btn-sm btn-light rounded-pill" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        /* 💡 حقل dir="auto" يضمن بدء كلام البوست من اليمين فوراً إذا كُتب بالعربية */
        <p className="mb-3 text-start card-text" dir="auto" style={{ whiteSpace: "pre-wrap", fontSize: "14px" }}>{postBody}</p>
      )}

      {post.image && (
        <div className="post-media-frame mb-3">
          <img src={post.image} alt="media" className="w-100 h-auto d-block" style={{ maxHeight: "420px", objectFit: "cover" }} />
        </div>
      )}

      <div className="d-flex align-items-center justify-content-start post-action-row">
        <button className="post-action-btn d-flex align-items-center" onClick={handleLikeToggle}>
          <span className="me-1">👍</span> {likesCount} Likes
        </button>
        <button className="post-action-btn d-flex align-items-center" onClick={toggleCommentsView}>
          <span className="me-1">💬</span> {commentsCount} Comments
        </button>
      </div>

      {showComments && (
        <div className="mt-3 pt-3 border-top" style={{ borderColor: "var(--border-custom)" }}>
          <div className="comments-section mb-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
            {commentsList.length === 0 ? (
              <p className="text-muted text-center py-2" style={{ fontSize: "12px" }}>No comments yet. Be the first to comment!</p>
            ) : (
              commentsList.map((comm) => (
                /* 💡 دعم الـ dir="auto" للتعليقات القديمة لتقرأ من اليمين بسلاسة تامة */
                <div key={comm.id} className="d-flex align-items-start mb-2 p-2 comment-box-custom" dir="auto">
                  <img src={comm.author?.profileImage || "https://placeholder.com"} alt="avatar" className="rounded-circle" style={{ width: "28px", height: "28px", objectFit: "cover" }} />
                  <div className="ms-2 text-start flex-grow-1">
                    <strong className="d-block" style={{ fontSize: "12px" }}>{comm.author?.firstName} {comm.author?.lastName}</strong>
                    <p className="mb-0 text-muted" style={{ fontSize: "12px" }}>{comm.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleCommentSubmit} className="d-flex gap-2">
            {/* 💡 دعم الـ dir="auto" لصندوق كتابة الكومنت الجديد ليتحول مؤشر الماوس لليمين فوراً عند قلب اللغة للغة العربية */}
            <input
              type="text"
              className="form-control form-control-sm comment-box-custom"
              placeholder="Write a comment... / اكتب تعليقاً..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              required
              dir="auto"
            />
            <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3">Send</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default PostCard;
