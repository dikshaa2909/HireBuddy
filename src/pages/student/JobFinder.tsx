import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, addDoc, Timestamp, getDoc, doc, updateDoc } from 'firebase/firestore';
// (unused Firebase Storage imports removed)
import { db, auth, storage } from '../../firebase';
import { toast } from 'react-hot-toast';
import { useJobContext, Job, Application } from '../../context/JobContext';

const JobFinder: React.FC = () => {
  const { jobs: contextJobs, loading: contextLoading, applyForJob, userEmail } = useJobContext();
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    jobType: '',
    location: '',
    salary: ''
  });
  const [hasResume, setHasResume] = useState<boolean>(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [appliedJobs, setAppliedJobs] = useState<string[]>(() => {
    const storedApplications = JSON.parse(localStorage.getItem('applications') || '[]');
    return storedApplications;
  });
  const [userApplications, setUserApplications] = useState<Application[]>([]);
  const [showResumeModal, setShowResumeModal] = useState<boolean>(false);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [selectedJobTitle, setSelectedJobTitle] = useState<string>('');
  const [selectedCompany, setSelectedCompany] = useState<string>('');

  // Fetch jobs directly from Firebase
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const jobsRef = collection(db, 'jobs');
        const querySnapshot = await getDocs(jobsRef);
        
        const jobsData: Job[] = [];
        querySnapshot.forEach((doc) => {
          jobsData.push({ id: doc.id, ...doc.data() } as Job);
        });
        
        setFilteredJobs(jobsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching jobs:', error);
        toast.error('Failed to load jobs');
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Check if user has a resume
  useEffect(() => {
    const checkResume = async () => {
      try {
        if (auth.currentUser) {
          const userEmail = auth.currentUser.email;
          const resumesRef = collection(db, 'resumes');
          const q = query(resumesRef, where('email', '==', userEmail));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            setHasResume(true);
            setResumeUrl(querySnapshot.docs[0].data().url);
          }
        }
      } catch (error) {
        console.error('Error checking resume:', error);
      }
    };

    checkResume();
  }, []);
  
  // Fetch user applications
  useEffect(() => {
    const fetchUserApplications = async () => {
      if (!auth.currentUser?.email) return;
      
      try {
        const applicationsRef = collection(db, 'applications');
        const q = query(applicationsRef, where('applicantEmail', '==', auth.currentUser.email));
        const querySnapshot = await getDocs(q);
        
        const applications: Application[] = [];
        const appliedJobIds: string[] = [];
        
        querySnapshot.forEach((doc) => {
          const application = { id: doc.id, ...doc.data() } as Application;
          applications.push(application);
          appliedJobIds.push(application.jobId);
        });
        
        setUserApplications(applications);
        setAppliedJobs(appliedJobIds);
        
        // Store in localStorage for persistence
        localStorage.setItem('applications', JSON.stringify(appliedJobIds));
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };
     
    fetchUserApplications();
  }, []);

  // Enhanced search and filter functionality
  useEffect(() => {
    if (loading) return;
    
    let result = [...filteredJobs];
    
    // Apply search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(job => 
        job.title?.toLowerCase().includes(searchLower) || 
        job.company?.toLowerCase().includes(searchLower) ||
        job.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply filters
    if (filters.jobType) {
      result = result.filter(job => job.type === filters.jobType);
    }
    
    if (filters.location) {
      result = result.filter(job => job.location?.includes(filters.location));
    }
    
    if (filters.salary) {
      const minSalary = parseInt(filters.salary);
      result = result.filter(job => {
        // Extract numeric value from salary string
        const salaryString = job.salary?.toString() || '';
        const numericValue = parseInt(salaryString.replace(/[^0-9]/g, ''));
        return !isNaN(numericValue) && numericValue >= minSalary;
      });
    }
    
    setFilteredJobs(result);
  }, [searchTerm, filters, loading]);

  const handleApply = (jobId: string, jobTitle: string, company: string) => {
    if (appliedJobs.includes(jobId)) {
      toast.error('You have already applied for this job');
      return;
    }
    
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error('You must be logged in to apply for jobs');
      return;
    }
    
    // Open the resume upload modal
    setSelectedJobId(jobId);
    setSelectedJobTitle(jobTitle);
    setSelectedCompany(company);
    setShowResumeModal(true);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFile(e.target.files[0]);
    }
  };
  
  const handleResumeUpload = async () => {
    if (!resumeFile) {
      toast.error('Please select a resume file');
      return;
    }
    
    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error('You must be logged in to apply for jobs');
      return;
    }
    
    setIsUploading(true);
    
    try {
      // In a real app, you would upload the file to storage
      // For this demo, we'll simulate a successful upload
      const fakeResumeUrl = URL.createObjectURL(resumeFile);
      setResumeUrl(fakeResumeUrl);
      setHasResume(true);
      
      // Create application with more details for HR visibility
      const application = {
        jobId: selectedJobId,
        jobTitle: selectedJobTitle,
        company: selectedCompany,
        applicantId: user.uid,
        applicantEmail: user.email,
        applicantName: user.displayName || 'Anonymous',
        status: 'pending' as 'pending', // Type assertion to match the union type
        appliedAt: Timestamp.now(),
        resumeUrl: fakeResumeUrl,
        viewed: false, // Track if HR has viewed this application
        notes: '', // Allow HR to add notes
        skills: [], // Can be populated from user profile later
        education: '', // Can be populated from user profile later
        experience: '' // Can be populated from user profile later
      };
      
      // Add application to Firestore
      const docRef = await addDoc(collection(db, 'applications'), application);
      
      // Update local state
      setAppliedJobs([...appliedJobs, selectedJobId]);
      setUserApplications([...userApplications, { id: docRef.id, ...application }]);
      
      // Store in localStorage
      localStorage.setItem('applications', JSON.stringify([...appliedJobs, selectedJobId]));
      
      // Update the job document to include this application ID
      const jobRef = doc(db, 'jobs', selectedJobId);
      const jobDoc = await getDoc(jobRef);
      
      if (jobDoc.exists()) {
        const jobData = jobDoc.data();
        const applications = jobData.applications || [];
        
        // Add this application to the job's applications array
        await updateDoc(jobRef, {
          applications: [...applications, docRef.id]
        });
      }
      
      // Use the context's applyForJob function to ensure consistency
      try {
        await applyForJob({
          jobId: selectedJobId,
          jobTitle: selectedJobTitle,
          company: selectedCompany,
          applicantEmail: user.email,
          applicantName: user.displayName || 'Anonymous',
          status: 'pending',
          resumeUrl: fakeResumeUrl
        });
      } catch (contextError) {
        console.error("Context application failed:", contextError);
        // Already added to Firestore directly, so this is just for context state
      }
      
      toast.success('Application submitted successfully! HR will review your application.');
      
      // Notify the backend about the new application
      try {
        fetch('http://localhost:5001/api/applications/new', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            applicationId: docRef.id,
            jobId: selectedJobId
          })
        });
      } catch (apiError) {
        console.error("Backend notification failed:", apiError);
        // Non-critical error, don't show to user
      }
      
      // Close the modal and reset state
      setShowResumeModal(false);
      setResumeFile(null);
      setSelectedJobId('');
      setSelectedJobTitle('');
      setSelectedCompany('');
    } catch (error) {
       console.error('Error applying for job:', error);
       toast.error('Failed to submit application');
     } finally {
       setIsUploading(false);
     }
   };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Find Your Next Opportunity</h1>
      
      {/* Resume Upload Modal */}
      {showResumeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
            <p className="mb-4 text-gray-600">Please upload your resume to apply for this position.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (PDF, DOC, DOCX)
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowResumeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleResumeUpload}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                disabled={!resumeFile || isUploading}
              >
                {isUploading ? 'Uploading...' : 'Apply Now'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search jobs by title, company, or keywords..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.jobType}
              onChange={(e) => setFilters({...filters, jobType: e.target.value})}
            >
              <option value="">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              placeholder="City or Remote"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Salary</label>
            <input
              type="number"
              placeholder="Minimum Salary"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.salary}
              onChange={(e) => setFilters({...filters, salary: e.target.value})}
            />
          </div>
        </div>
      </div>
      
      {/* Job Listings */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredJobs.length === 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    No jobs found matching your criteria. Try adjusting your search or filters.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <div key={job.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                      <p className="text-gray-600 mt-1">{job.company}</p>
                    </div>
                    <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                       {job.type}
                     </div>
                   </div>
                   
                   <div className="mt-4 flex flex-wrap gap-2">
                     <div className="text-gray-600 text-sm flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                       </svg>
                       {job.location || 'Remote'}
                     </div>
                     
                     {job.salary && (
                       <div className="text-gray-600 text-sm flex items-center">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                         </svg>
                         ${job.salary}
                       </div>
                     )}
                     
                     <div className="text-gray-600 text-sm flex items-center">
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                       </svg>
                       {job.postedAt ? (typeof job.postedAt.toDate === 'function' ? job.postedAt.toDate().toLocaleDateString() : new Date(job.postedAt).toLocaleDateString()) : 'Recently posted'}
                     </div>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-gray-700">{job.description}</p>
                  </div>
                  
                  <div className="mt-6 flex justify-between items-center">
                    {!hasResume && (
                      <div className="text-sm text-red-600">
                        You need to create a resume before applying
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleApply(job.id!, job.title!, job.company!)}
                      disabled={appliedJobs.includes(job.id || '')}
                      className={`px-4 py-2 rounded-md ${
                        appliedJobs.includes(job.id || '')
                          ? 'bg-green-500 text-white cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {appliedJobs.includes(job.id || '') ? 'Applied' : 'Apply Now'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default JobFinder;