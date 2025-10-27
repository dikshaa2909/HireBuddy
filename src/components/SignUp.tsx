// components/Signup.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, setUserRole, ROLES } from '../firebase';
import { Search } from 'lucide-react';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT); // Default to student role
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple client-side validation
    if (!email || !password || !displayName) {
      setError('Name, email and password are required.');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: displayName
      });
      
      // Set user role in Firestore
      await setUserRole(user.uid, role);
      
      // Redirect based on role
      if (role === ROLES.HR) {
        navigate('/analytics');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error: any) {
      // Firebase-specific error handling
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already registered. Please login instead.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Failed to sign up. Please try again.');
      }
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
          Sign up for HireBuddy
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Full Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 p-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  role === ROLES.STUDENT 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300'
                }`}
                onClick={() => setRole(ROLES.STUDENT)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 dark:text-white">Student</span>
                  <input
                    id="student-role"
                    name="role"
                    type="radio"
                    checked={role === ROLES.STUDENT}
                    onChange={() => setRole(ROLES.STUDENT)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Find jobs, build your resume, and apply to positions
                </p>
              </div>
              
              <div 
                className={`border rounded-lg p-4 cursor-pointer transition-all ${
                  role === ROLES.HR 
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' 
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300'
                }`}
                onClick={() => setRole(ROLES.HR)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-800 dark:text-white">HR Professional</span>
                  <input
                    id="hr-role"
                    name="role"
                    type="radio"
                    checked={role === ROLES.HR}
                    onChange={() => setRole(ROLES.HR)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Post jobs, review applications, and find candidates
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
            disabled={isLoading}
          >
            <Search size={20} />
            <span>{isLoading ? 'Signing up...' : 'Sign up'}</span>
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-600 dark:text-indigo-300 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
