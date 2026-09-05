import React from "react";

const CommentReply = ({ reply }) => {
  return (
    <div className="d-flex align-items-start mt-2 p-2 bg-white rounded-3 border-end border-light border-3 text-end" style={{ direction: "rtl" }}>
      <img
        src={reply.author?.profileImage || "https://placeholder.com"}
        alt="reply author"
        className="rounded-circle"
        style={{ width: "30px", height: "30px", objectFit: "cover" }}
      />
      <div className="ms-2 flex-grow-1 bg-light p-2 rounded-3" style={{ fontSize: "13px" }}>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span className="fw-bold text-dark">
            {reply.author ? `${reply.author.firstName} ${reply.author.lastName}` : "مستخدم مجهول"}
          </span>
          <small className="text-muted" style={{ fontSize: "10px" }}>
            {new Date(reply.createdAt).toLocaleDateString("ar-EG")}
          </small>
        </div>
        <p className="mb-0 text-secondary">{reply.content}</p>
      </div>
    </div>
  );
};

export default CommentReply;
