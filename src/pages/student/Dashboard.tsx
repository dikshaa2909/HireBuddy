import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { FileText, Search, Brain, BarChart2 } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!auth.currentUser) return;
      
      try {
        // Fetch student applications
        const applicationsQuery = query(
          collection(db, 'applications'),
          where('studentId', '==', auth.currentUser.uid)
        );
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const applicationsData = applicationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(applicationsData);
        
        // Fetch recent jobs
        const jobsQuery = query(collection(db, 'jobs'));
        const jobsSnapshot = await getDocs(jobsQuery);
        const jobsData = jobsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentJobs(jobsData.slice(0, 3)); // Only first 3 jobs
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'reviewing':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ Fixed Aptitude Test link here
  const dashboardCards = [
    {
      title: 'Resume Builder',
      description: 'Create and update your professional resume',
      icon: <FileText size={24} />,
      link: '/student/resume-builder',
      color: 'bg-blue-500'
    },
    {
      title: 'Job Finder',
      description: 'Find and apply to job opportunities',
      icon: <Search size={24} />,
      link: '/student/job-finder',
      color: 'bg-green-500'
    },
    {
      title: 'Aptitude Tests',
      description: 'Practice and improve your skills',
      icon: <Brain size={24} />,
      link: '/student/aptitude-test', // Fixed route
      color: 'bg-purple-500'
    },
    {
      title: 'Application Status',
      description: 'Track your job applications',
      icon: <BarChart2 size={24} />,
      link: '/student/applications',
      color: 'bg-orange-500'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Student Dashboard</h1>
      
      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardCards.map((card, index) => (
          <Link 
            key={index} 
            to={card.link}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className={`${card.color} text-white p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4`}>
              {card.icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{card.title}</h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2">{card.description}</p>
          </Link>
        ))}
      </div>
      
      {/* Application Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Applications</h2>
          <Link to="/student/applications" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            View All
          </Link>
        </div>
        
        {applications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Applied Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {applications.slice(0, 3).map((application) => (
                  <tr key={application.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {application.jobTitle || 'Unknown Job'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {application.company || 'Unknown Company'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(application.status)}`}>
                        {application.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {application.appliedDate ? new Date(application.appliedDate.toDate()).toLocaleDateString() : 'Unknown'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No applications found. Start applying for jobs!</p>
            <Link to="/student/job-finder" className="mt-2 inline-block text-indigo-600 dark:text-indigo-400 hover:underline">
              Find Jobs
            </Link>
          </div>
        )}
      </div>
      
      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Recent Job Postings</h2>
          <Link to="/student/job-finder" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            View All
          </Link>
        </div>
        
        {recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentJobs.map((job) => (
              <div key={job.id} className="border dark:border-gray-700 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 dark:text-white">{job.title || 'Job Title'}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{job.company || 'Company Name'}</p>
                <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span>{job.location || 'Location'}</span>
                  <span className="mx-2">•</span>
                  <span>{job.type || 'Job Type'}</span>
                </div>
                <Link 
                  to={`/student/job-finder/${job.id}`} 
                  className="mt-3 inline-block text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 dark:text-gray-400">No job postings available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
