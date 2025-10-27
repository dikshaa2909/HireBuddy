import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, getDocs, addDoc, query, where, doc, updateDoc, arrayUnion, getDoc, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { db } from '../firebase';

// Define types
export interface Job {
  id?: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  description: string;
  postedAt: any;
  deadline: any;
  hrEmail: string;
  requirements?: string[];
  keySkills?: string[];
  benefits?: string[];
  additionalInfo?: {
    education: string;
    experience: string;
  };
  applications?: string[];
}

export interface Application {
  id?: string;
  jobId: string;
  jobTitle: string;
  company: string;
  applicantEmail: string;
  applicantName: string;
  status: 'pending' | 'reviewing' | 'interviewed' | 'accepted' | 'rejected';
  appliedAt: any;
  resumeUrl?: string;
}

interface JobContextType {
  jobs: Job[];
  applications: Application[];
  userEmail: string | null;
  loading: boolean;
  addJob: (job: Job) => Promise<string>;
  applyForJob: (application: Omit<Application, 'appliedAt'>) => Promise<void>;
  updateApplicationStatus: (applicationId: string, status: Application['status']) => Promise<void>;
  getUserApplications: () => Application[];
  getHrApplications: () => Application[];
  getJobById: (id: string) => Job | undefined;
  refreshJobs: () => Promise<void>;
  refreshApplications: () => Promise<void>;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

export const useJobContext = () => {
  const context = useContext(JobContext);
  if (!context) {
    throw new Error('useJobContext must be used within a JobProvider');
  }
  return context;
};

interface JobProviderProps {
  children: ReactNode;
}

export const JobProvider: React.FC<JobProviderProps> = ({ children }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email || null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch jobs and applications
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchJobs(),
          fetchApplications()
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userEmail]);

  const fetchJobs = async () => {
    try {
      const jobsCollection = collection(db, 'jobs');
      const jobsSnapshot = await getDocs(jobsCollection);
      const jobsList = jobsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Job));
      setJobs(jobsList);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    }
  };

  const fetchApplications = async () => {
    try {
      const applicationsCollection = collection(db, 'applications');
      const applicationsSnapshot = await getDocs(applicationsCollection);
      const applicationsList = applicationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Application));
      setApplications(applicationsList);
    } catch (error) {
      console.error("Error fetching applications:", error);
    }
  };

  const addJob = async (job: Job): Promise<string> => {
    try {
      // Ensure job has the correct format for both HR and student sides
      const jobWithTimestamp = {
        ...job,
        postedAt: Timestamp.now(),
        deadline: job.deadline || Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        hrEmail: userEmail,
        applications: [],
        // Ensure these fields exist for compatibility with both sides
        type: job.type || job.jobType || 'Full-time',
        salary: job.salary || (job.pay ? `${job.pay.currency} ${job.pay.min}-${job.pay.max}` : 'Competitive')
      };

      const docRef = await addDoc(collection(db, 'jobs'), jobWithTimestamp);
      
      // Update local state
      setJobs(prevJobs => [...prevJobs, { ...jobWithTimestamp, id: docRef.id }]);
      
      // Refresh jobs to ensure consistency
      await fetchJobs();
      
      return docRef.id;
    } catch (error) {
      console.error("Error adding job:", error);
      throw error;
    }
  };

  const applyForJob = async (applicationData: Omit<Application, 'appliedAt'>) => {
    try {
      if (!userEmail) throw new Error("User not authenticated");

      const application = {
        ...applicationData,
        applicantEmail: userEmail,
        status: 'pending' as const,
        appliedAt: Timestamp.now()
      };

      // Add application to applications collection
      const docRef = await addDoc(collection(db, 'applications'), application);
      
      // Update job document to include this application
      const jobRef = doc(db, 'jobs', application.jobId);
      await updateDoc(jobRef, {
        applications: arrayUnion(docRef.id)
      });

      // Update local state
      setApplications(prev => [...prev, { ...application, id: docRef.id }]);
      
      // Update the job in local state
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.id === application.jobId 
            ? { 
                ...job, 
                applications: [...(job.applications || []), docRef.id] 
              } 
            : job
        )
      );
    } catch (error) {
      console.error("Error applying for job:", error);
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: Application['status']) => {
    try {
      const applicationRef = doc(db, 'applications', applicationId);
      await updateDoc(applicationRef, { status });
      
      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      );
    } catch (error) {
      console.error("Error updating application status:", error);
      throw error;
    }
  };

  const getUserApplications = () => {
    if (!userEmail) return [];
    return applications.filter(app => app.applicantEmail === userEmail);
  };

  const getHrApplications = () => {
    if (!userEmail) return [];
    
    // Get all jobs posted by this HR
    const hrJobIds = jobs
      .filter(job => job.hrEmail === userEmail)
      .map(job => job.id);
    
    // Return applications for those jobs
    return applications.filter(app => 
      app.jobId && hrJobIds.includes(app.jobId)
    );
  };

  const getJobById = (id: string) => {
    return jobs.find(job => job.id === id);
  };

  const refreshJobs = async () => {
    await fetchJobs();
  };

  const refreshApplications = async () => {
    await fetchApplications();
  };

  const value = {
    jobs,
    applications,
    userEmail,
    loading,
    addJob,
    applyForJob,
    updateApplicationStatus,
    getUserApplications,
    getHrApplications,
    getJobById,
    refreshJobs,
    refreshApplications
  };

  return (
    <JobContext.Provider value={value}>
      {children}
    </JobContext.Provider>
  );
};