
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Show loading state while we check authentication
    return (
      <div className="min-h-screen flex items-center justify-center bg-construction-gray-lightest">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-construction-blue"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to auth page if user is not authenticated
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If authenticated, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute;
