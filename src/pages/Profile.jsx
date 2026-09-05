import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchPosts, createPost, clearPosts } from "../features/posts/postSlice";
import { updateProfileData } from "../features/auth/authSlice";
import { openChatWithParticipant } from "../features/chat/chatSlice";
import api from "../config/axios";
import Navbar from "../components/Navbar";
import PostCard from "../components/PostCard";

const Profile = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  
  const { posts, loading } = useSelector((state) => state.posts);
  const currentUser = useSelector((state) => state.auth.user);
  
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileUserLoading] = useState(true);
  
  // حالات كتابة المنشور الجديد من داخل البروفايل الشخصي
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [creating, setCreating] = useState(false);

  // حالات لوحة تعديل البيانات والصور الشخصية (Modal)
  const [showEditModal, setShowEditModal] = useState(false);
  const [bioText, setBioText] = useState("");
  const [profileImgFile, setProfileImgFile] = useState(null);
  const [coverImgFile, setCoverImgFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const isMyProfile = id === currentUser?.id;

  const getProfileData = async () => {
    setProfileUserLoading(true);
    try {
      const response = await api.get(`/users/${id}`);
      setProfileUser(response.data);
      setBioText(response.data.bio || "");
    } catch (err) {
      console.error(err);
    }
    setProfileUserLoading(false);
  };

  useEffect(() => {
    getProfileData();
    dispatch(clearPosts());
    dispatch(fetchPosts({ page: 1, pageSize: 30 }));
  }, [id, dispatch]);

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
      dispatch(clearPosts());
      dispatch(fetchPosts({ page: 1, pageSize: 30 }));
    }
    setCreating(false);
  };

  // 💡 تشغيل زر المراسلة الفوري عبر الـ Action المباشر في الريدوكس
  const handleOpenDirectChat = () => {
    if (!profileUser) return;
    dispatch(openChatWithParticipant(profileUser));
  };

  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    
    const formData = new FormData();
    formData.append("bio", bioText);
    
    if (profileImgFile && profileImgFile[0]) {
      formData.append("profileImage", profileImgFile[0]);
    }
    if (coverImgFile && coverImgFile[0]) {
      formData.append("coverImage", coverImgFile[0]);
    }

    const result = await dispatch(updateProfileData(formData));
    if (updateProfileData.fulfilled.match(result)) {
      setShowEditModal(false);
      setProfileImgFile(null);
      setCoverImgFile(null);
      await getProfileData();
    }
    setUpdatingProfile(false);
  };

  const profilePosts = posts.filter((post) => post.userId === id);

  if (profileLoading) {
    return (
      <div className="profile-modern-view min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="profile-modern-view min-vh-100" style={{ direction: "ltr", textAlign: "left" }}>
      <Navbar />
      {profileUser && (
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              
              {/* كارت رأس الحساب الشخصي (Cover & Profile Header) */}
              <div className="card custom-bootstrap-card border-0 overflow-hidden mb-4 p-0">
                <div className="profile-cover-banner" style={{ background: "linear-gradient(135deg, #0d6efd 0%, #a855f7 100%)", height: "240px", position: "relative" }}>
                  {profileUser.coverImage && (
                    <img src={profileUser.coverImage} alt="cover" className="w-100 h-100" style={{ objectFit: "cover" }} />
                  )}
                </div>
                
                <div className="px-4 pb-4 d-sm-flex align-items-end justify-content-between">
                  <div className="d-flex align-items-end flex-wrap flex-sm-nowrap text-center text-sm-start">
                    <div className="profile-avatar-wrapper mx-auto mx-sm-0" style={{ marginTop: "-65px", zIndex: 10 }}>
                      <img
                        src={profileUser.profileImage || "https://placeholder.com"}
                        alt="avatar"
                        className="rounded-circle bg-white p-1 border shadow-sm"
                        style={{ width: "120px", height: "120px", objectFit: "cover" }}
                      />
                    </div>
                    
                    <div className="ms-sm-4 mt-3 mt-sm-0 text-start">
                      <h3 className="fw-bold mb-1 text-dark">{profileUser.firstName} {profileUser.lastName}</h3>
                      <p className="text-muted small mb-2">@{profileUser.username}</p>
                      <p className="small mb-0 text-secondary">{profileUser.bio || "No bio summary shared yet."}</p>
                    </div>
                  </div>

                  <div className="mt-3 mt-sm-0 d-flex gap-2 justify-content-center">
                    {isMyProfile ? (
                      <button 
                        className="btn btn-sm btn-outline-primary rounded-pill px-3 py-2 fw-bold"
                        onClick={() => setShowEditModal(true)}
                        type="button"
                      >
                        ⚙️ Edit Profile
                      </button>
                    ) : (
                      <button 
                        className="btn btn-sm btn-primary rounded-pill px-4 py-2 shadow-sm d-flex align-items-center gap-1 fw-bold"
                        onClick={handleOpenDirectChat}
                        type="button"
                      >
                        ✉️ Message
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {/* صندوق إضافة المنشورات داخل الحساب الشخصي للمالك فقط */}
              {isMyProfile && (
                <div className="card custom-bootstrap-card shadow-sm p-4 mb-4 border-0">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={currentUser?.profileImage || "https://placeholder.com"}
                      alt="avatar"
                      className="rounded-circle border"
                      style={{ width: "42px", height: "42px", objectFit: "cover" }}
                    />
                    <h6 className="mb-0 fw-bold ms-3 text-dark">Create an update on your profile, {currentUser?.firstName}</h6>
                  </div>
                  <form onSubmit={handlePostSubmit}>
                    <textarea
                      className="form-control glass-textarea mb-3 p-3 text-start"
                      rows="3"
                      placeholder="What's new with you? Share something interesting..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                      style={{ resize: "none" }}
                    ></textarea>
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <label className="btn btn-sm btn-outline-secondary rounded-pill px-3 mb-0" style={{ cursor: "pointer" }}>
                        🖼️ Add Photo
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="d-none" 
                          onChange={(e) => setImageFile(e.target.files[0])} 
                        />
                      </label>
                      <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4 py-2 shadow-sm fw-bold" disabled={creating}>
                        {creating ? "Publishing..." : "Post Update"}
                      </button>
                    </div>
                    {imageFile && (
                      <div className="mt-2 p-2 bg-dark bg-opacity-10 border rounded d-flex justify-content-between align-items-center">
                        <small className="text-info">📎 Attached: {imageFile.name}</small>
                        <button type="button" className="btn-close" onClick={() => setImageFile(null)}></button>
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* قسم استعراض منشورات الجدول الزمني */}
              <h5 className="fw-bold mb-3 px-1 text-start text-dark">Timeline Updates</h5>
              {loading && profilePosts.length === 0 && (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status"></div>
                </div>
              )}
              {!loading && profilePosts.length === 0 ? (
                <div className="card text-center p-5 text-muted shadow-sm" style={{ borderRadius: "16px" }}>
                  📭 No publications shared on this timeline yet.
                </div>
              ) : (
                profilePosts.map((post) => (
                  <div className="mb-3" key={post.id}>
                    <PostCard post={post} />
                  </div>
                ))
              )}

            </div>
          </div>
        </div>
      )}

      {/* لوحة تعديل البيانات المنبثقة التفاعلية (Bootstrap Modal) */}
      {showEditModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 3000 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-2" style={{ borderRadius: "16px", background: "#ffffff" }}>
              <div className="modal-header border-0">
                <h5 className="modal-title fw-bold text-dark">Update Profile Information</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <form onSubmit={handleSaveProfileSettings}>
                <div className="modal-body text-start">
                  
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Biography (Bio)</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={bioText}
                      onChange={(e) => setBioText(e.target.value)}
                      placeholder="Write something about yourself..."
                      style={{ borderRadius: "10px" }}
                    ></textarea>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Profile Avatar Image</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm" 
                      accept="image/*"
                      onChange={(e) => setProfileImgFile(e.target.files)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">Cover Banner Image</label>
                    <input 
                      type="file" 
                      className="form-control form-control-sm" 
                      accept="image/*"
                      onChange={(e) => setCoverImgFile(e.target.files)}
                    />
                  </div>

                </div>
                <div className="modal-footer border-0 d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-light rounded-pill px-3" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-sm btn-primary rounded-pill px-4" style={{ background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)", border: "none" }} disabled={updatingProfile}>
                    {updatingProfile ? "Uploading..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
