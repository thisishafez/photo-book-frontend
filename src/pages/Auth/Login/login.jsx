import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import "./Login.css";

import camera from "../../../assets/camera.svg";
import cameraDarkMode from "../../../assets/cameraDarkMode.svg";
import logo from "../../../assets/logo.svg";
import logoDarkMode from "../../../assets/logoDarkMode.svg";

export default function Login() {
  const navigate = useNavigate();

  const { login } = useAuth();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [apiError, setApiError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ""
      }));
    }

    setApiError("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
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
    setApiError("");

    try {
      const result = await login(
        formData.email,
        formData.password
      );

      if (result.success) {
        setIsFlashing(true);

        setTimeout(() => {
          setIsFlashing(false);
          navigate("/");
        }, 300);
      } else {
        setApiError(
          result.error || "Login failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Login failed:", error);

      setApiError(
        "An unexpected error occurred. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`container${darkMode ? " container-dark" : ""} ${
        isFlashing ? "flash" : ""
      }`}
    >
      <section className="left">
        <div className="camera">
          <img
            src={darkMode ? cameraDarkMode : camera}
            alt="Camera Frame"
          />

          <form
            className="loginBox"
            onSubmit={handleSubmit}
          >
            <h2>Welcome Back</h2>

            {apiError && (
              <div className="api-error">
                {apiError}
              </div>
            )}

            <div className="form-group">
              <input
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? "error" : ""}
                disabled={isLoading}
              />

              {errors.email && (
                <span className="error-message">
                  {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? "error" : ""}
                disabled={isLoading}
              />

              {errors.password && (
                <span className="error-message">
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            <div className="register-link">
              <Link to="/register">
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="right">
        <div className="right-content">
          <div className="logo-wrapper">
            <img
              src={darkMode ? logoDarkMode : logo}
              alt="Shared Event Photo Book Logo"
            />
          </div>

          <h1>Shared Event Photo Book</h1>

          <p>
            Share photos from your favorite moments with
            the people who were actually there.
          </p>
        </div>
      </section>
    </div>
  );
}