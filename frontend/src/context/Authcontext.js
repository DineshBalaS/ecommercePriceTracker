// src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from "react";
import api from "../api/api"; // Use the pre-configured axios instance
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Checks for an existing token in localStorage on initial app load.
   * If a token exists, it attempts to fetch the user's data to resume the session.
   */
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      // Set the token for all subsequent API requests in this session
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      try {
        // The /me endpoint should return the full user object
        const res = await api.get("/auth/me"); 
        setUser(res.data); // The user object is directly in res.data
      } catch (err) {
        console.error("🔴 Auth Check Failed (token might be expired):", err.response?.data || err.message);
        // If the token is invalid, clear it
        localStorage.removeItem("token");
        setUser(null);
      }
    }
    setLoading(false);
  };

  /**
   * Logs in the user, saves the token, and navigates to the dashboard.
   */
  const login = async (email, password) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      
      const { access_token, user } = res.data;

      // --- Token Handling ---
      localStorage.setItem("token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(user);
      setError(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("🔴 Login Failed:", err.response?.data || err.message);
      const errorMessage = err.response?.data?.detail || "An unexpected error occurred.";
      if (typeof errorMessage === "string") {
        setError(errorMessage);
      } else {
        setError("Invalid credentials or server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Signs up a new user, saves the token, and navigates to the dashboard.
   */
  const signup = async (username, email, password) => {
    try {
      setLoading(true);
      const res = await api.post("/auth/signup", { username, email, password });

      const { access_token, user } = res.data;

      // --- Token Handling ---
      localStorage.setItem("token", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;

      setUser(user);
      setError(null);
      navigate("/dashboard");
    } catch (err) {
      console.error("🔴 Signup Failed:", err);
      let errorMessage = "An unexpected error occurred during signup.";
      if (err.response) {
        const detail = err.response.data.detail;
        if (typeof detail === "string") {
          errorMessage = detail;
        } else if (Array.isArray(detail)) {
          const firstError = detail[0];
          const field = firstError.loc[firstError.loc.length - 1];
          errorMessage = `Invalid ${field}: ${firstError.msg}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logs out the user by clearing the token and local state.
   */
  const logout = () => {
    // No need to call a backend endpoint, just clear the client-side state
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
  };

  // Run the auth check when the component mounts
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access the auth context
export const useAuth = () => useContext(AuthContext);

