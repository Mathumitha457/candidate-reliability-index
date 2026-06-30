import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import RoleRoute from "./components/RoleRoute";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Candidates from "./pages/Candidates";
import AddCandidate from "./pages/AddCandidate";
import EditCandidate from "./pages/EditCandidate";
import CandidateDetail from "./pages/CandidateDetail";
import ComparePage from "./pages/ComparePage";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <PrivateRoute>
                  <Candidates />
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates/add"
              element={
                <PrivateRoute>
                  <RoleRoute allowedRoles={["admin", "teacher"]}>
                    <AddCandidate />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates/edit/:id"
              element={
                <PrivateRoute>
                  <RoleRoute allowedRoles={["admin", "teacher"]}>
                    <EditCandidate />
                  </RoleRoute>
                </PrivateRoute>
              }
            />
            <Route
              path="/candidates/:id"
              element={
                <PrivateRoute>
                  <CandidateDetail />
                </PrivateRoute>
              }
            />
            <Route
              path="/compare"
              element={
                <PrivateRoute>
                  <ComparePage />
                </PrivateRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </AuthProvider>
  );
}