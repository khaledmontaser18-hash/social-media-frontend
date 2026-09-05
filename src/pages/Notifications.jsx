import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; // 💡 تم إضافة الاستيراد للتوجيه
import { fetchNotifications, markNotificationsAsRead } from "../features/notifications/notificationsSlice";
import Navbar from "../components/Navbar";

const Notifications = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate(); // 💡 تفعيل دالة التوجيه
  const { notifications, loading } = useSelector((state) => state.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const handleMarkAsRead = () => {
    dispatch(markNotificationsAsRead());
  };

  // 💡 دالة معالجة الضغط والتوجيه لصفحة المنشور التفصيلية
  const handleNotificationClick = (notif) => {
    if ((notif.type === "like" || notif.type === "comment" || notif.type === "share") && notif.entityId) {
      navigate(`/posts/${notif.entityId}`); // التوجيه لصفحة تفاصيل المنشور
    } else if (notif.type === "follow") {
      navigate(`/profile/${notif.senderId}`);
    }
  };

  const getNotificationText = (type) => {
    switch (type) {
      case "like": return "liked your publication.";
      case "comment": return "added a comment to your post.";
      case "share": return "shared your post with their feed.";
      default: return "sent you a new interaction.";
    }
  };

  return (
    <div className="bg-light min-vh-100 text-start" style={{ direction: "ltr" }}>
      <Navbar />
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold text-dark mb-0">🔔 Notification Center</h4>
              {notifications.length > 0 && (
                <button 
                  className="btn text-white btn-sm rounded-pill fw-semibold px-3" 
                  style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", border: "none" }}
                  onClick={handleMarkAsRead}
                >
                  ✓ Mark all as read
                </button>
              )}
            </div>

            {loading && (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
              </div>
            )}

            {!loading && notifications.length === 0 ? (
              <div className="card text-center p-5 shadow-sm text-muted" style={{ borderRadius: "16px" }}>
                📭 Your notification center is empty right now.
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`card mb-2 shadow-sm border-0 ${!notif.isRead ? "border-start border-4" : ""}`}
                  onClick={() => handleNotificationClick(notif)} // 💡 تفعيل حدث الضغط
                  style={{ 
                    backgroundColor: notif.isRead ? "#ffffff" : "rgba(147, 51, 234, 0.04)", 
                    borderRadius: "12px",
                    borderLeftColor: notif.isRead ? "transparent" : "#a855f7",
                    cursor: "pointer" // مؤشر ماوس تفاعلي
                  }}
                >
                  <div className="card-body d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <img
                        src={notif.sender?.profileImage || "https://placeholder.com"}
                        alt="sender"
                        className="rounded-circle"
                        style={{ width: "45px", height: "45px", objectFit: "cover" }}
                      />
                      <div className="ms-3 text-start">
                        <p className="mb-0 fw-bold text-dark">
                          {notif.sender ? `${notif.sender.firstName} ${notif.sender.lastName}` : "User"}
                        </p>
                        <small className="text-muted">{getNotificationText(notif.type)}</small>
                      </div>
                    </div>
                    <small className="text-muted" style={{ fontSize: "11px" }}>
                      {new Date(notif.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                    </small>
                  </div>
                </div>
              ))
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
