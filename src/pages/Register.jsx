import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, clearError } from "../features/auth/authSlice";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      navigate("/");
    }
    return () => {
      dispatch(clearError());
    };
  }, [token, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser(formData));
  };

  return (
    <div className="neon-wrapper min-vh-100 d-flex align-items-center justify-content-center px-3">
      <div className="neon-glow-center"></div>
      <div className="glass-panel text-white p-5 w-100 shadow" style={{ maxWidth: "480px", borderRadius: "24px" }}>
        
        <div className="text-center mb-4">
          <h1 className="fw-light display-5 tracking-wide mb-2" style={{ letterSpacing: "1px" }}>Create Account</h1>
          <p className="text-white-50 small">Join our creative social network today</p>
        </div>
        
        {error && (
          <div className="alert alert-danger bg-danger bg-opacity-20 text-white border-0 text-center py-2 mb-4" style={{ borderRadius: "10px" }}>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control glass-input"
                placeholder="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <input
                type="text"
                className="form-control glass-input"
                placeholder="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control glass-input text-center"
              placeholder="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              className="form-control glass-input text-center"
              placeholder="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4">
            <input
              type="password"
              className="form-control glass-input text-center"
              placeholder="Password (Min 8 Characters)"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn w-100 glass-btn text-uppercase mb-4" disabled={loading}>
            {loading ? "Creating Account..." : "SIGN UP"}
          </button>
          
          <div className="text-center" style={{ fontSize: "13px" }}>
            <span className="text-white-50">Already have an account? </span>
            <Link to="/login" className="text-white fw-bold text-decoration-none ms-1 hover-underline">Login here</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
