import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { FileText, ExternalLink } from 'lucide-react';
import { useJobContext } from '../../context/JobContext';

interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  status: string;
  appliedAt: Timestamp;
  resumeUrl?: string;
  location?: string;
  jobUrl?: string;
  applicantEmail?: string;
  applicantName?: string;
}

const Applications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { refreshApplications } = useJobContext();

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user || !user.email) {
          setLoading(false);
          return;
        }

        // Query Firestore for applications by this user's email
        const applicationsRef = collection(db, 'applications');
        const q = query(
          applicationsRef, 
          where('applicantEmail', '==', user.email),
          orderBy('appliedAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        let fetchedApplications: Application[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedApplications.push({
            id: doc.id,
            jobId: data.jobId,
            jobTitle: data.jobTitle || 'Unknown Position',
            company: data.company || 'Unknown Company',
            status: data.status || 'pending',
            appliedAt: data.appliedAt,
            resumeUrl: data.resumeUrl,
            location: data.location || 'Not specified',
            jobUrl: '#',
            applicantEmail: data.applicantEmail,
            applicantName: data.applicantName
          });
        });
        
        // If no applications found, add dummy data
        if (fetchedApplications.length === 0) {
          console.log('No applications found, adding dummy data');
          
          // Create dummy applications with Timestamp objects
          const now = new Date();
          
          fetchedApplications = [
            {
              id: 'app1',
              jobId: 'job1',
              jobTitle: 'Senior Software Engineer',
              company: 'TechCorp',
              status: 'reviewing',
              appliedAt: Timestamp.fromDate(now),
              resumeUrl: 'https://example.com/resume1.pdf',
              location: 'San Francisco, CA',
              jobUrl: 'https://example.com/job1',
              applicantEmail: user.email,
              applicantName: user.displayName || 'Current User'
            },
            {
              id: 'app2',
              jobId: 'job2',
              jobTitle: 'UX/UI Designer',
              company: 'DesignHub',
              status: 'interview',
              appliedAt: Timestamp.fromDate(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), // 3 days ago
              resumeUrl: 'https://example.com/resume2.pdf',
              location: 'Remote',
              jobUrl: 'https://example.com/job2',
              applicantEmail: user.email,
              applicantName: user.displayName || 'Current User'
            },
            {
              id: 'app3',
              jobId: 'job3',
              jobTitle: 'Data Scientist',
              company: 'DataWorks',
              status: 'applied',
              appliedAt: Timestamp.fromDate(new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)), // 7 days ago
              resumeUrl: 'https://example.com/resume3.pdf',
              location: 'New York, NY',
              jobUrl: 'https://example.com/job3',
              applicantEmail: user.email,
              applicantName: user.displayName || 'Current User'
            },
            {
              id: 'app4',
              jobId: 'job4',
              jobTitle: 'Product Manager',
              company: 'InnovateCo',
              status: 'accepted',
              appliedAt: Timestamp.fromDate(new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)), // 14 days ago
              resumeUrl: 'https://example.com/resume4.pdf',
              location: 'Austin, TX',
              jobUrl: 'https://example.com/job4',
              applicantEmail: user.email,
              applicantName: user.displayName || 'Current User'
            },
            {
              id: 'app5',
              jobId: 'job5',
              jobTitle: 'DevOps Engineer',
              company: 'CloudSystems',
              status: 'rejected',
              appliedAt: Timestamp.fromDate(new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000)), // 21 days ago
              resumeUrl: 'https://example.com/resume5.pdf',
              location: 'Seattle, WA',
              jobUrl: 'https://example.com/job5',
              applicantEmail: user.email,
              applicantName: user.displayName || 'Current User'
            }
          ];
        }
        
        setApplications(fetchedApplications);
        
        // Also refresh the applications in the context
        refreshApplications();
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, [refreshApplications]);

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

  const filteredApplications = filter === 'all' 
    ? applications 
    : applications.filter(app => app.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Applications</h1>
        
        <div className="mt-4 md:mt-0">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-4 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Applications</option>
            <option value="applied">Applied</option>
            <option value="reviewing">Under Review</option>
            <option value="interview">Interview</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {filteredApplications.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.map((application) => (
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
                      {application.appliedAt ? new Date(application.appliedAt.toDate()).toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          title="View Details"
                        >
                          <FileText size={18} />
                        </button>
                        {application.jobUrl && (
                          <a 
                            href={application.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                            title="View Job Posting"
                          >
                            <ExternalLink size={18} />
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-4">
            <FileText size={48} className="text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No applications found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {filter === 'all' 
              ? "You haven't applied to any jobs yet." 
              : `You don't have any applications with '${filter}' status.`}
          </p>
          <button 
            onClick={() => setFilter('all')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            {filter === 'all' ? 'Find Jobs to Apply' : 'View All Applications'}
          </button>
        </div>
      )}
    </div>
  );
};

export default Applications;