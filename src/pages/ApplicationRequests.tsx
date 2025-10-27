import React, { useState, useEffect } from 'react';
import { Download, Send, Eye } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useJobContext, Job, Application } from '../context/JobContext';
import { toast } from 'react-hot-toast';

// Using Application interface from JobContext with additional fields
interface JobApplication extends Application {
  _id?: string; // For backward compatibility
  viewed?: boolean;
  notes?: string;
}

function ApplicationRequests() {
  const { updateApplicationStatus } = useJobContext();
  const [filteredApplications, setFilteredApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [interviewModal, setInterviewModal] = useState<{
    isOpen: boolean;
    candidateId: string | null;
    email: string;
    link: string;
  }>({
    isOpen: false,
    candidateId: null,
    email: '',
    link: ''
  });

  const [candidateDetailsModal, setCandidateDetailsModal] = useState<{
    isOpen: boolean;
    candidate: JobApplication | null;
    position: string;
  }>({
    isOpen: false,
    candidate: null,
    position: '',
  });

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  // Fetch jobs and applications directly from Firebase
  useEffect(() => {
    const fetchData = async () => {
      if (!userEmail) return;
      
      setLoading(true);
      try {
        // Fetch jobs posted by the current HR
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, where('hrEmail', '==', userEmail));
        const jobsSnapshot = await getDocs(jobsQuery);
        
        const jobsData: Job[] = [];
        const jobIds: string[] = [];
        
        jobsSnapshot.forEach((doc) => {
          const jobData = { id: doc.id, ...doc.data() } as Job;
          jobsData.push(jobData);
          jobIds.push(doc.id);
        });
        
        // Add dummy jobs if none exist
        if (jobsData.length === 0) {
          const dummyJobs: Job[] = [
            {
              id: 'job1',
              title: 'Senior Software Engineer',
              company: 'TechCorp',
              location: 'San Francisco, CA',
              description: 'Looking for an experienced software engineer with React and Node.js skills.',
              requirements: ['5+ years experience', 'React', 'Node.js', 'TypeScript'],
              salary: '$120,000 - $150,000',
              hrEmail: userEmail || 'hr@example.com',
              createdAt: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'job2',
              title: 'UX/UI Designer',
              company: 'DesignHub',
              location: 'New York, NY',
              description: 'Seeking a creative designer to join our product team.',
              requirements: ['3+ years experience', 'Figma', 'Adobe XD', 'User Research'],
              salary: '$90,000 - $110,000',
              hrEmail: userEmail || 'hr@example.com',
              createdAt: new Date().toISOString(),
              status: 'active'
            },
            {
              id: 'job3',
              title: 'Data Scientist',
              company: 'DataWorks',
              location: 'Remote',
              description: 'Join our data science team to build ML models for our products.',
              requirements: ['Python', 'TensorFlow', 'SQL', 'Statistics'],
              salary: '$130,000 - $160,000',
              hrEmail: userEmail || 'hr@example.com',
              createdAt: new Date().toISOString(),
              status: 'active'
            }
          ];
          
          jobsData.push(...dummyJobs);
          jobIds.push(...dummyJobs.map(job => job.id));
        }
        
        setJobs(jobsData);
        
        // Fetch all applications for these jobs
        const applicationsRef = collection(db, 'applications');
        const applicationsQuery = query(applicationsRef, where('jobId', 'in', jobIds.length > 0 ? jobIds : ['no-jobs']));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        
        const applicationsData: JobApplication[] = [];
        
        applicationsSnapshot.forEach((doc) => {
          const data = doc.data();
          applicationsData.push({ 
            id: doc.id, 
            ...data,
            viewed: data.viewed || false,
            notes: data.notes || ''
          } as JobApplication);
        });
        
        // Add dummy applications if none exist
        if (applicationsData.length === 0) {
          const dummyApplications: JobApplication[] = [
            {
              id: 'app1',
              jobId: 'job1',
              jobTitle: 'Senior Software Engineer',
              userEmail: 'john.doe@example.com',
              userName: 'John Doe',
              resume: 'https://example.com/resume1.pdf',
              coverLetter: 'I am excited to apply for this position...',
              status: 'pending',
              appliedAt: new Date().toISOString(),
              viewed: true,
              notes: 'Strong candidate with good experience',
              skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
              experience: '7 years',
              education: 'MS Computer Science, Stanford University'
            },
            {
              id: 'app2',
              jobId: 'job1',
              jobTitle: 'Senior Software Engineer',
              userEmail: 'jane.smith@example.com',
              userName: 'Jane Smith',
              resume: 'https://example.com/resume2.pdf',
              coverLetter: 'With my 6 years of experience in software development...',
              status: 'reviewing',
              appliedAt: new Date(Date.now() - 86400000).toISOString(),
              viewed: true,
              notes: 'Excellent communication skills, technical interview scheduled',
              skills: ['React', 'Angular', 'Java', 'AWS'],
              experience: '6 years',
              education: 'BS Computer Engineering, MIT'
            },
            {
              id: 'app3',
              jobId: 'job2',
              jobTitle: 'UX/UI Designer',
              userEmail: 'mike.wilson@example.com',
              userName: 'Mike Wilson',
              resume: 'https://example.com/resume3.pdf',
              coverLetter: 'As a designer with 4 years of experience...',
              status: 'pending',
              appliedAt: new Date(Date.now() - 172800000).toISOString(),
              viewed: false,
              notes: '',
              skills: ['Figma', 'Adobe XD', 'Sketch', 'User Research'],
              experience: '4 years',
              education: 'BFA Design, RISD'
            },
            {
              id: 'app4',
              jobId: 'job3',
              jobTitle: 'Data Scientist',
              userEmail: 'sarah.johnson@example.com',
              userName: 'Sarah Johnson',
              resume: 'https://example.com/resume4.pdf',
              coverLetter: 'I am a data scientist with expertise in machine learning...',
              status: 'accepted',
              appliedAt: new Date(Date.now() - 259200000).toISOString(),
              viewed: true,
              notes: 'Excellent candidate, offer sent',
              skills: ['Python', 'TensorFlow', 'SQL', 'R', 'Statistics'],
              experience: '5 years',
              education: 'PhD Statistics, UC Berkeley'
            },
            {
              id: 'app5',
              jobId: 'job3',
              jobTitle: 'Data Scientist',
              userEmail: 'alex.chen@example.com',
              userName: 'Alex Chen',
              resume: 'https://example.com/resume5.pdf',
              coverLetter: 'With my background in statistical analysis...',
              status: 'rejected',
              appliedAt: new Date(Date.now() - 345600000).toISOString(),
              viewed: true,
              notes: 'Not enough experience with required technologies',
              skills: ['Python', 'R', 'SPSS', 'Excel'],
              experience: '2 years',
              education: 'MS Data Science, NYU'
            }
          ];
          
          applicationsData.push(...dummyApplications);
        }
        
        // Try to fetch from backend API as well (fallback)
        try {
          const response = await fetch(`/api/applications/${userEmail}`);
          if (response.ok) {
            const apiApplications = await response.json();
            
            // Merge applications from API with those from Firestore
            const existingIds = new Set(applicationsData.map(app => app.id));
            
            apiApplications.forEach((app: any) => {
              if (!existingIds.has(app.id)) {
                applicationsData.push(app as JobApplication);
              }
            });
          }
        } catch (apiError) {
          console.log('API fetch failed, using Firestore data only:', apiError);
        }
        
        setFilteredApplications(applicationsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [userEmail]);

  const handleStatusChange = async (applicationId: string, newStatus: JobApplication['status'], event: React.ChangeEvent<HTMLSelectElement>) => {
    // Stop propagation to prevent row click from triggering
    event.stopPropagation();

    try {
      // Update in Firestore
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update application status in context
      updateApplicationStatus(applicationId, newStatus);

      // Update local state
      setFilteredApplications(prev =>
          prev.map(candidate =>
              candidate.id === applicationId
                  ? { ...candidate, status: newStatus }
                  : candidate
          )
      );
      
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Failed to update application status');
    }
  };

  const handleSendInterviewLink = async () => {
    // Simulate email sending logic here
    console.log(`Sending interview link to ${interviewModal.email}`);
    console.log(`Interview Link: ${interviewModal.link}`);

    try {
      // Update in Firestore if we have a candidate ID
      if (interviewModal.candidateId) {
        const applicationRef = doc(db, 'applications', interviewModal.candidateId);
        await updateDoc(applicationRef, {
          interviewLink: interviewModal.link,
          interviewScheduledAt: new Date().toISOString()
        });
        toast.success('Interview link sent successfully');
      }
      
      // Close the modal after sending the link
      setInterviewModal({ isOpen: false, candidateId: null, email: '', link: '' });
    } catch (error) {
      console.error('Error sending interview link:', error);
      toast.error('Failed to send interview link');
    }
  };

  const handleRowClick = async (candidate: JobApplication) => {
    // Find the associated job
    const job = jobs.find((job) => job.id === candidate.jobId);

    try {
      // Mark application as viewed in Firestore if not already viewed
      if (!candidate.viewed) {
        const applicationRef = doc(db, 'applications', candidate.id || candidate._id!);
        await updateDoc(applicationRef, {
          viewed: true,
          viewedAt: new Date().toISOString()
        });
        
        // Update local state
        setFilteredApplications(prev => 
          prev.map(app => (app.id || app._id) === (candidate.id || candidate._id) ? 
            {...app, viewed: true} : app)
        );
      }
      
      setCandidateDetailsModal({
        isOpen: true,
        candidate,
        position: job ? job.title : 'Unknown Position', // Fetch position from job
      });
    } catch (error) {
      console.error('Error marking application as viewed:', error);
    }
  };

  // Helper function to safely get job title
  const getJobTitle = (application: JobApplication): string => {
    const job = jobs.find((job) => job.id === application.jobId);
    return job ? job.title : 'Unknown Position';
  };

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Application Requests</h1>

        {loading ? (
            <div className="flex justify-center items-center p-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        ) : (
            /* Candidates Table */
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Position
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Resume
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredApplications.length > 0 ? (
                      filteredApplications.map((candidate) => {
                        // Get job title
                        const position = getJobTitle(candidate);

                        return (
                            <tr
                                key={candidate.id || candidate._id}
                                onClick={() => handleRowClick(candidate)}
                                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                                    {candidate.firstName} {candidate.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {candidate.email}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {position}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <select
                                    value={candidate.status}
                                    onChange={(e) => handleStatusChange(candidate.id || candidate._id!, e.target.value as JobApplication['status'], e)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Reviewed">Reviewed</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <a
                                    href={candidate.resume}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center space-x-1"
                                >
                                  <Download size={16} />
                                  <span>Download</span>
                                </a>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setInterviewModal({
                                        isOpen: true,
                                        candidateId: candidate.id || candidate._id!,
                                        email: candidate.email,
                                        link: ''
                                      });
                                    }}
                                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  Send Interview Link
                                </button>
                              </td>
                            </tr>
                        );
                      })
                  ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          {userEmail ? 'No job applications found for your posted jobs.' : 'Please sign in to view applications.'}
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
            </div>
        )}

        {/* Interview Link Modal */}
        {interviewModal.isOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Send Interview Link</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                        type="email"
                        value={interviewModal.email}
                        readOnly
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Interview Link
                    </label>
                    <input
                        type="url"
                        value={interviewModal.link}
                        onChange={(e) => setInterviewModal(prev => ({ ...prev, link: e.target.value }))}
                        placeholder="https://meet.google.com/..."
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="flex space-x-4 mt-6">
                    <button
                        onClick={() => setInterviewModal({ isOpen: false, candidateId: null, email: '', link: '' })}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                        onClick={handleSendInterviewLink}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2"
                    >
                      <Send size={16} />
                      <span>Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}

        {/* Candidate Details Modal */}
        {candidateDetailsModal.isOpen && candidateDetailsModal.candidate && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Candidate Details</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                        type="text"
                        value={`${candidateDetailsModal.candidate.firstName} ${candidateDetailsModal.candidate.lastName}`}
                        readOnly
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <input
                        type="email"
                        value={candidateDetailsModal.candidate.email}
                        readOnly
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Position
                    </label>
                    <input
                        type="text"
                        value={candidateDetailsModal.position}
                        readOnly
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cover Letter
                    </label>
                    <textarea
                        value={candidateDetailsModal.candidate.coverLetter}
                        readOnly
                        rows={4}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  {candidateDetailsModal.candidate.customQuestionsAnswers &&
                      Object.keys(candidateDetailsModal.candidate.customQuestionsAnswers).length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Custom Questions Answers
                            </label>
                            <div className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                              {Object.entries(candidateDetailsModal.candidate.customQuestionsAnswers).map(([question, answer]) => (
                                  <div key={question} className="mb-2">
                                    <strong>{question}:</strong> {answer}
                                  </div>
                              ))}
                            </div>
                          </div>
                      )}
                  <div className="flex space-x-4 mt-6">
                    <button
                        onClick={() => setCandidateDetailsModal({ isOpen: false, candidate: null, position: '' })}
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
        )}
      </div>
  );
}

export default ApplicationRequests;