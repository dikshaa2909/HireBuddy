// src/components/Login.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth, getUserRole, ROLES } from "../firebase";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>(ROLES.STUDENT);
  const navigate = useNavigate();

  // Redirect if user already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        let role = selectedRole;
        try {
          const firestoreRole = await getUserRole(user.uid);
          if (firestoreRole) role = firestoreRole;
        } catch {
          console.warn("Cannot read role from Firestore, using selected role");
        }

        if (role === ROLES.STUDENT) navigate("/student/dashboard");
        else navigate("/analytics");
      }
    });
    return () => unsubscribe();
  }, [navigate, selectedRole]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      let role = selectedRole;
      try {
        const firestoreRole = await getUserRole(userCredential.user.uid);
        if (firestoreRole) role = firestoreRole;
      } catch {
        console.warn("Cannot read role from Firestore, using selected role");
      }

      if (role === ROLES.STUDENT) navigate("/student/dashboard");
      else navigate("/analytics");
    } catch {
      setError("Login failed. Check email/password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Login as
            </label>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === ROLES.STUDENT 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedRole(ROLES.STUDENT)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">Student</span>
                  <input
                    type="radio"
                    checked={selectedRole === ROLES.STUDENT}
                    onChange={() => setSelectedRole(ROLES.STUDENT)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  selectedRole === ROLES.HR 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300'
                }`}
                onClick={() => setSelectedRole(ROLES.HR)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-white">HR Professional</span>
                  <input
                    type="radio"
                    checked={selectedRole === ROLES.HR}
                    onChange={() => setSelectedRole(ROLES.HR)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
