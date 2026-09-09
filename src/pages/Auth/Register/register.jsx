import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import "./register.css";

import camera from "../../../assets/camera.svg";
import cameraDarkMode from "../../../assets/cameraDarkMode.svg";
import logo from "../../../assets/logo.svg";
import logoDarkMode from "../../../assets/logoDarkMode.svg";

export default function Register() {
  const navigate = useNavigate();

  const { register, login } = useAuth();
  const { darkMode } = useTheme();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    accountType: "user"
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }


    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
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

      const result = await register(
        formData.email,
        formData.password,
        formData.accountType
      );


      if (result.success) {

        // Registration does not return tokens.
        // Login immediately so authenticated requests in ProfileSetup work.
        const loginResult = await login(
          formData.email,
          formData.password
        );


        if (loginResult.success) {

          setIsFlashing(true);

          setTimeout(() => {

            setIsFlashing(false);

            navigate('/profile-setup');

          }, 300);


        } else {

          setApiError(
            "Account created, but auto-login failed. Please log in manually."
          );

          navigate('/login');

        }


      } else {

        if (
          result.error?.toLowerCase().includes("already registered")
        ) {

          setApiError(
            "Email is already registered. Try logging in instead."
          );

        } else {

          setApiError(
            result.error || "Registration failed. Please try again."
          );

        }

      }


    } catch (error) {

      console.error("Registration failed:", error);

      setApiError(
        "An unexpected error occurred. Please try again."
      );

    } finally {

      setIsLoading(false);

    }
  };


  return (
    <div
      className={`container${darkMode ? ' container-dark' : ''} ${
        isFlashing ? 'flash' : ''
      }`}
    >

      <section className="left">

        <div className="camera">

          <img
            src={darkMode ? cameraDarkMode : camera}
            alt="Camera Frame"
          />


          <form
            className="registerBox"
            onSubmit={handleSubmit}
          >

            <h2>Create Account</h2>


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
                autoComplete="new-password"
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




            <div className="form-group">

              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? "error" : ""}
                disabled={isLoading}
              />


              {errors.confirmPassword && (
                <span className="error-message">
                  {errors.confirmPassword}
                </span>
              )}

            </div>




            <div className="form-group">

              <select
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                disabled={isLoading}
              >

                <option value="user">
                  Regular user
                </option>

                <option value="host">
                  Host
                </option>

                <option value="moderator">
                  Moderator
                </option>

              </select>

            </div>




            <button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Register"}
            </button>




            <div className="login-link">

              <Link to="/login">
                Already have an account? Log in
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


          <h1>
            Join the community
          </h1>


          <p>
            Start sharing photos from your favorite moments with the people who were there.
          </p>


        </div>


      </section>


    </div>
  );
}