import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import StudentLayout from './components/StudentLayout';
import Landing from './pages/Landing';
import ProfileRanks from './pages/ProfileRanks';
import HrGpt from './pages/HrGpt';
import FindCandidates from './pages/FindCandidates';
import DocGeneration from './pages/DocGeneration';
import Analytics from './pages/Analytics';
import ApplicationRequests from './pages/ApplicationRequests';
import { ThemeProvider } from './context/ThemeContext';
import { JobProvider } from './context/JobContext'; // Import JobProvider
import JobBuilder from './pages/JobBuilder'; // Fixed typo
import Login from './components/Login';
import Signup from './components/SignUp';
import ProtectedRoute from './components/ProtectedRoute'; // Moved to a separate file
import NotFound from './pages/NotFound';
import PostedJobs from "./pages/PostedJobs.tsx"; // Optional: Add a 404 page

// Student Pages
import Dashboard from './pages/student/Dashboard';
import Applications from './pages/student/Applications';
import ResumeBuilder from './pages/student/ResumeBuilder';
import JobFinder from './pages/student/JobFinder';
import AptitudeTest from './pages/student/AptitudeTest';
import Profile from './pages/student/Profile';


const queryClient = new QueryClient();

function App() {
  return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <JobProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

              {/* HR Protected Routes */}
              <Route
                  element={
                    <ProtectedRoute requiredRole="hr">
                      <Layout />
                    </ProtectedRoute>
                  }
              >
                <Route path="/profile-ranks" element={<ProfileRanks />} />
                <Route path="/hr-gpt" element={<HrGpt />} />
                <Route path="/find-candidates" element={<FindCandidates />} />
                <Route path="/doc-generation" element={<DocGeneration />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/job-builder" element={<JobBuilder />} />
                <Route path="/posted-jobs" element={<PostedJobs />} />
                <Route path="/applications" element={<ApplicationRequests />} />
              </Route>

              {/* Student Protected Routes */}
              <Route
                  element={
                    <ProtectedRoute requiredRole="student">
                      <StudentLayout />
                    </ProtectedRoute>
                  }
              >
                <Route path="/student/dashboard" element={<Dashboard />} />
                <Route path="/student/applications" element={<Applications />} />
                <Route path="/student/resume-builder" element={<ResumeBuilder />} />
                <Route path="/student/job-finder" element={<JobFinder />} />
                <Route path="/student/aptitude-test" element={<AptitudeTest />} />
                <Route path="/student/profile" element={<Profile />} />
              </Route>

              {/* Fallback Route (404 Not Found) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          </JobProvider>
        </ThemeProvider>
      </QueryClientProvider>
  );
}

export default App;