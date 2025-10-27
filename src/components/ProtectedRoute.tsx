// src/components/ProtectedRoute.tsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, getUserRole, ROLES } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

interface Props {
  children: JSX.Element;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<Props> = ({ children, requiredRole }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [user, setUser] = useState(auth.currentUser);

  useEffect(() => {
    console.log("ProtectedRoute mounted, checking auth state");
    
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.uid);
      setUser(currentUser);
      
      if (!currentUser) {
        console.log("No user found, redirecting to login");
        setIsLoading(false);
        return;
      }

      try {
        const role = await getUserRole(currentUser.uid);
        console.log("User role:", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error getting user role:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If requiredRole is specified, check if user has the required role
  if (requiredRole && userRole !== requiredRole) {
    // Redirect HR to HR dashboard
    if (userRole === ROLES.HR) {
      return <Navigate to="/analytics" replace />;
    }
    // Redirect students to student dashboard
    if (userRole === ROLES.STUDENT) {
      return <Navigate to="/student/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
