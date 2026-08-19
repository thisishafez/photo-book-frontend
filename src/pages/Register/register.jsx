import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./Register.css";
import camera from "../../assets/Group 1.svg";
import logo from "../../assets/Group 3 (1).svg";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    setApiError("");
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    setApiError("");
    
    try {
      const result = await register(formData.username, formData.email, formData.password);
      
      if (result.success) {
        setIsFlashing(true);
        setTimeout(() => {
          setIsFlashing(false);
          navigate('/login');
        }, 300);
      } else {
        // Handle specific error messages
        if (result.error === 'USERNAME_TAKEN') {
          setApiError('Username is already taken. Please choose another.');
        } else {
          setApiError(result.error || 'Registration failed. Please try again.');
        }
      }
    } catch (error) {
      console.error("Registration failed:", error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${isFlashing ? 'flash' : ''}`}>
      <section className="left">
        <div className="camera">
          <img src={camera} alt="Camera Frame" />

          <form className="registerBox" onSubmit={handleSubmit}>
            <h2>Create Account</h2>

            {apiError && <div className="api-error">{apiError}</div>}

            <div className="form-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className={errors.username ? "error" : ""}
                disabled={isLoading}
              />
              {errors.username && <span className="error-message">{errors.username}</span>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                disabled={isLoading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                disabled={isLoading}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Register'}
            </button>

            <div className="login-link">
              <Link to="/login">Already have an account? Log in</Link>
            </div>
          </form>
        </div>
      </section>

      <section className="right">
        <div className="right-content">
          <div className="logo-wrapper">
            <img src={logo} alt="Shared Event Photo Book Logo" />
          </div>
          <h1>Join the community</h1>
          <p>Start sharing photos from your favorite moments with the people who were there.</p>
        </div>
      </section>
    </div>
  );
}