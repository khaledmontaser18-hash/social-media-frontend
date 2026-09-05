import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom"; 
import { io } from "socket.io-client";
import api from "../config/axios";
import socket from "../config/socket";
// const socket = io("http://localhost:5000", { autoConnect: false });

const NotificationsDropdown = () => {
  const navigate = useNavigate(); 
  const { user } = useSelector((state) => state.auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchNotifications = async () => {
      try {
        const response = await api.get("/notifications");
        const list = response.data?.notifications || [];
        setNotifications(list);
        const unread = list.filter((n) => !n.isRead).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error fetching notifications archive:", error);
      }
    };
    fetchNotifications();
    socket.connect();
    socket.emit("join_room", user.id);
    
    socket.on("new_notification", (newNotif) => {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === newNotif.id);
        if (exists) return prev;
        return [newNotif, ...prev];
      });
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.off("new_notification");
      socket.disconnect();
    };
  }, [user]);

  const handleToggleDropdown = async () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      try {
        setUnreadCount(0);
        await api.patch("/notifications/mark-as-read"); 
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

  const handleNotificationClick = (notifItem) => {
    const actual = notifItem?.notification || notifItem?.data || notifItem;
    setIsOpen(false); 

    if (actual.type === "like" || actual.type === "comment" || actual.type === "share") {
      if (actual.entityId) {
        navigate(`/posts/${actual.entityId}`); 
      }
    } else if (actual.type === "follow") {
      navigate(`/profile/${actual.senderId || notifItem.senderId}`);
    }
  };

  return (
    <div className="position-relative" style={{ direction: "ltr", fontFamily: "system-ui, sans-serif" }}>
      <style>{`
        .notif-btn {
          border: none; background: #f8f9fa; border-radius: 50%; width: 42px; height: 42px;
          transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
        }
        .notif-btn:hover { background: #e4e8f0; transform: scale(1.05); }
        .notif-dropdown-card {
          width: 380px; z-index: 1050; border-radius: 16px; max-height: 420px; overflow-y: auto;
          background: #ffffff !important; box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        }
        [data-theme="dark"] .notif-dropdown-card {
          background: #0f172a !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
        }
        .notif-item { 
          transition: all 0.2s ease; 
          border-bottom: 1px solid #f1f2f6; 
          display: flex !important;
          align-items: center !important;
        }
        [data-theme="dark"] .notif-item {
          border-bottom: 1px solid rgba(255,255,255,0.05) !important;
        }
        .notif-item:hover { background-color: #f8f9fa !important; }
        [data-theme="dark"] .notif-item:hover { background-color: rgba(255,255,255,0.04) !important; }
        .notif-unread { background-color: rgba(147, 51, 234, 0.06) !important; }
        .notif-unread:hover { background-color: rgba(147, 51, 234, 0.1) !important; }
        .bg-neon-purple { background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%) !important; }
        
        /* 💡 تعيين كلاس اللون الأحمر القاتم بشكل إجباري وصارم */
        .notif-username-red {
          color: #b91c1c !important; /* درجة أحمر قاتم واضحة وحادة جداً */
          font-weight: 700 !important;
          display: inline-block;
        }
        
        .notif-text-wrapper {
          white-space: normal;
          word-break: break-word;
          line-height: 1.4;
        }
      `}</style>

      <button className="notif-btn position-relative" onClick={handleToggleDropdown}>
        🔔
        {unreadCount > 0 && (
          <span 
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-neon-purple border border-white"
            style={{ fontSize: "0.75rem", padding: "4px 7px" }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="card notif-dropdown-card position-absolute end-0 mt-2 p-2 border-0 shadow">
          <div className="d-flex justify-content-between align-items-center px-2 py-2 border-bottom mb-2">
            <span className="fw-bold fs-6" style={{ color: "var(--text-main-custom)" }}>Live Notifications ✨</span>
            {unreadCount > 0 && <span className="badge bg-neon-purple rounded-pill small">{unreadCount} New</span>}
          </div>
          
          <div className="list-group list-group-flush" style={{ borderRadius: "12px", overflow: "hidden" }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => {
                const actualNotif = notif?.notification || notif?.data || notif;
                const senderUser = actualNotif?.sender || notif?.sender;
                const isNotificationRead = actualNotif?.isRead ?? notif?.isRead ?? true;

                return (
                  <div 
                    key={actualNotif.id || notif.id} 
                    className={`list-group-item list-group-item-action p-3 notif-item border-0 ${!isNotificationRead ? "notif-unread fw-semibold" : ""}`}
                    onClick={() => handleNotificationClick(notif)} 
                    style={{ cursor: "pointer" }}
                  >
                    <div 
                      className="text-white rounded-circle d-flex justify-content-center align-items-center fw-bold" 
                      style={{ 
                        width: "38px", height: "38px", minWidth: "38px", marginRight: "12px",
                        background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)" 
                      }}
                    >
                      {senderUser?.firstName ? senderUser.firstName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="flex-grow-1 text-start notif-text-wrapper">
                      {/* 💡 تطبيق كلاس اللون الأحمر الثابت والواضح */}
                      <span className="notif-username-red small">
                        @{senderUser?.username || "user"}
                      </span>{" "}
                      <span className="text-secondary small" style={{ color: "var(--text-muted-custom)" }}>
                        {actualNotif.type === "like" && "liked your creative post ❤️"}
                        {actualNotif.type === "comment" && "left an interactive comment on your post 💬"}
                        {actualNotif.type === "follow" && "started following your personal profile 👥"}
                        {actualNotif.type === "share" && "shared your post with friends 🚀"}
                      </span>
                      <div className="text-muted" style={{ fontSize: "0.7rem", marginTop: "2px" }}>
                        {new Date(actualNotif.createdAt || notif.createdAt).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-5 text-muted">
                <div className="fs-3 mb-2">🚀</div>
                <p className="mb-0 small">Your inbox is completely clear!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
