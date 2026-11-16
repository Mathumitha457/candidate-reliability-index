import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize Auth
  useEffect(() => {
    const storedUser = localStorage.getItem("reliabilix_user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (err) {
        localStorage.removeItem("reliabilix_user");
      }
    }
    setLoading(false);
  }, []);

  // Update dynamic data-role attribute for CSS Variables
  useEffect(() => {
    if (user && user.role) {
      document.documentElement.setAttribute("data-role", user.role);
    } else {
      document.documentElement.removeAttribute("data-role");
    }
  }, [user]);

  // Axios Interceptors Configuration
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const storedUser = localStorage.getItem("reliabilix_user");
        if (storedUser) {
          try {
            const { token } = JSON.parse(storedUser);
            if (token) {
              config.headers.Authorization = `Bearer ${token}`;
            }
          } catch (e) {
            console.error("Error reading token from localStorage:", e);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
          // Force redirect to login page
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post("https://candidate-reliability-index.onrender.com/api/auth/login", {
        email,
        password,
      });
      const data = response.data;
      setUser(data);
      localStorage.setItem("reliabilix_user", JSON.stringify(data));
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Login failed. Please try again.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("reliabilix_user");
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
