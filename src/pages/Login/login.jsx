import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import camera from "../../assets/Group 1.svg";

export default function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // TODO: Call API
      console.log("Login form submitted:", formData);
    }
  };

  return (
    <div className="container">
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
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <button type="submit">Login</button>

            <div className="register-link">
              <Link to="/register">Don't have an account? Sign up</Link>
            </div>
          </form>
        </div>
      </section>

      <section className="right">
        <div className="right-content">
          <h1>Shared Event Photo Book</h1>
          <p>Share photos from your favorite moments with the people who were actually there.</p>
        </div>
      </section>
    </div>
  );
}