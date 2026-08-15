import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import camera from "../../assets/Group 1.svg";
import logo from "../../assets/Group 3 (1).svg";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);

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
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsFlashing(true);
      setTimeout(() => {
        setIsFlashing(false);
        navigate('/');
      }, 300);
      
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`container ${isFlashing ? 'flash' : ''}`}>
      <section className="left">
        <div className="camera">
          <img src={camera} alt="Camera Frame" />

          <form className="loginBox" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>

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

            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </button>

            <div className="register-link">
              <Link to="/register">Don't have an account? Sign up</Link>
            </div>
          </form>
        </div>
      </section>

      <section className="right">
        <div className="right-content">
          <div className="logo-wrapper">
            <img src={logo} alt="Shared Event Photo Book Logo" />
          </div>
          <h1>Shared Event Photo Book</h1>
          <p>Share photos from your favorite moments with the people who were actually there.</p>
        </div>
      </section>
    </div>
  );
}