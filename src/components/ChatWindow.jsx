import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessageData } from "../features/chat/chatSlice";

const ChatWindow = ({ participant, onClose }) => {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.auth.user);
  
  // 💡 نعود لقراءة مصفوفة الرسائل المباشرة والأصلية من الـ Redux بدون أي فلاتر معقدة تفشل أونلاين
  const { messages, loading } = useSelector((state) => state.chat);
  
  const [content, setContent] = useState("");
  const messagesEndRef = useRef(null);

  // جلب الرسائل فوراً عند فتح نافذة المحادثة
  useEffect(() => {
    if (participant?.id) {
      dispatch(fetchMessages(participant.id));
    }
  }, [dispatch, participant?.id]);

  // تمرير التمرير التلقائي لأسفل الصندوق عند وصول رسائل جديدة
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    await dispatch(sendMessageData({
      receiverId: participant.id,
      content: content.trim()
    }));
    setContent("");
  };

  return (
    <div id="chat-window-container" className="position-fixed bottom-0 end-0 m-3 shadow-lg d-flex flex-column overflow-hidden text-start" 
         style={{ 
           width: "360px", 
           height: "460px", 
           zIndex: 2000, 
           direction: "ltr",
           background: "var(--glass-card-bg)",
           backdropFilter: "blur(20px) saturate(140%)",
           WebkitBackdropFilter: "blur(20px) saturate(140%)",
           border: "1px solid var(--glass-card-border)",
           boxShadow: "var(--glass-card-shadow)",
           borderRadius: "20px"
         }}>
      
      {/* رأس صندوق الشات */}
      <div className="bg-primary text-white p-3 d-flex align-items-center justify-content-between" style={{ borderBottom: "1px solid var(--glass-card-border)" }}>
        <div className="d-flex align-items-center">
          <img 
            src={participant.profileImage || "https://placeholder.com"} 
            alt="avatar" 
            className="rounded-circle border" 
            style={{ width: "35px", height: "35px", objectFit: "cover", borderColor: "var(--glass-card-border)" }}
          />
          <h6 className="mb-0 fw-bold ms-2 text-white">{participant.firstName} {participant.lastName}</h6>
        </div>
        <button className="btn-close btn-close-white btn-sm" onClick={onClose} type="button"></button>
      </div>

      {/* منطقة عرض فقاعات الرسائل المصفاة حياً */}
      <div className="p-3 flex-grow-1" style={{ overflowY: "auto", background: "transparent" }}>
        {loading && <div className="text-center text-muted pt-5">Fetching messages...</div>}
        
        {!loading && currentChatMessages.length === 0 && (
          <div className="text-center text-muted pt-5" style={{ fontSize: "13px" }}>👋 Say hello to start the conversation!</div>
        )}

        {!loading && currentChatMessages.map((msg, index) => {
          const isMe = msg.senderId === currentUser?.id;
          return (
            <div 
              key={msg.id || index} 
              className={`d-flex mb-2 ${isMe ? "justify-content-end" : "justify-content-start"}`}
            >
              <div 
                className="p-2 rounded-3 text-start fs-6 shadow-sm"
                style={{
                  maxWidth: "75%",
                  whiteSpace: "pre-wrap",
                  backgroundColor: isMe ? "var(--neon-accent)" : "rgba(0,0,0,0.05)",
                  borderRadius: isMe ? "12px 12px 0 12px" : "12px 12px 12px 0",
                  border: "1px solid var(--glass-card-border)"
                }}
              >
                <p className="mb-0 px-1 fw-medium" style={{ color: isMe ? "#ffffff" : "var(--text-main-custom)" }}>
                  {msg.content}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* صندوق إدخال النص */}
      <form onSubmit={handleSend} className="d-flex border-top p-2 w-100 align-items-center" style={{ borderColor: "var(--glass-card-border)", background: "rgba(0,0,0,0.02)" }}>
        <input
          type="text"
          className="form-control text-start px-3 form-control-sm rounded-pill flex-grow-1"
          placeholder="Type a personal message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          style={{ background: "var(--input-bg-sub)", color: "var(--text-main-custom)", borderColor: "var(--border-custom)" }}
        />
        <button type="submit" className="btn btn-primary btn-sm rounded-pill px-3 ms-2 fw-bold" style={{ background: "var(--neon-accent)", border: "none" }}>Send</button>
      </form>

    </div>
  );
};

export default ChatWindow;
