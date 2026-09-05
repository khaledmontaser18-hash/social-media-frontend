import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { createComment } from "../features/comments/commentsSlice";
import CommentReply from "./CommentReply";

const CommentItem = ({ comment, postId, onRefreshPost }) => {
  const dispatch = useDispatch();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmitting(true);
    await dispatch(createComment({
      content: replyContent,
      postId: postId,
      parentCommentId: comment.id // تحديد أن هذا الطلب هو رد فرعي للتعليق الحالي
    }));

    setReplyContent("");
    setShowReplyForm(false);
    setSubmitting(false);
    if (onRefreshPost) onRefreshPost(); // إعادة تحميل بيانات المنشور لرؤية الرد الجديد فوراً
  };

  return (
    <div className="mb-3 border-bottom border-light pb-2 text-end">
      <div className="d-flex align-items-start">
        <img
          src={comment.author?.profileImage || "https://placeholder.com"}
          alt="comment author"
          className="rounded-circle"
          style={{ width: "35px", height: "35px", objectFit: "cover" }}
        />
        <div className="ms-2 flex-grow-1 bg-light p-2 rounded-3" style={{ fontSize: "14px" }}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="fw-bold text-dark">
              {comment.author ? `${comment.author.firstName} ${comment.author.lastName}` : "مستخدم مجهول"}
            </span>
            <small className="text-muted" style={{ fontSize: "11px" }}>
              {new Date(comment.createdAt).toLocaleDateString("ar-EG")}
            </small>
          </div>
          <p className="mb-0 text-dark">{comment.content}</p>
        </div>
      </div>

      {/* زر تفعيل صندوق الرد الفوري */}
      <div className="ms-5 mt-1 text-end">
        <button 
          className="btn btn-link btn-sm p-0 text-decoration-none fw-semibold text-muted"
          style={{ fontSize: "12px" }}
          onClick={() => setShowReplyForm(!showReplyForm)}
        >
          ↩ رد
        </button>

        {/* نموذج كتابة رد فرعي */}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="d-flex mt-2">
            <input
              type="text"
              className="form-control form-control-sm me-2"
              placeholder="اكتب رداً على هذا التعليق..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm px-3" disabled={submitting}>
              {submitting ? "..." : "إرسال"}
            </button>
          </form>
        )}

        {/* عرض الردود التابعة لهذا التعليق (إن وجدت) */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 border-start ps-2">
            {comment.replies.map((reply) => (
              <CommentReply key={reply.id} reply={reply} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
