import React, { useState, useEffect } from 'react';
import { Search, ExternalLink, Filter, Download } from 'lucide-react';
import { collection, getDocs, query, where, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  skills?: string[];
  education?: any[];
  experience?: any[];
  resumeUrl?: string;
  appliedAt: string;
  jobId?: string;
  jobTitle?: string;
  company?: string;
}

function FindCandidates() {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [allCandidates, setAllCandidates] = useState<Candidate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch applications from Firebase on initial render
  useEffect(() => {
    const fetchCandidates = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userEmail = auth.currentUser?.email;
        if (!userEmail) {
          setError('Please sign in to view candidates');
          setIsLoading(false);
          return;
        }
        
        // First get all jobs posted by this HR
        const jobsRef = collection(db, 'jobs');
        const jobsQuery = query(jobsRef, where('hrEmail', '==', userEmail));
        const jobsSnapshot = await getDocs(jobsQuery);
        
        const jobIds: string[] = [];
        const jobsMap = new Map();
        
        jobsSnapshot.forEach((doc) => {
          const jobData = { id: doc.id, ...doc.data() };
          jobIds.push(doc.id);
          jobsMap.set(doc.id, jobData);
        });
        
        // Create dummy jobs if none found
        if (jobIds.length === 0) {
          const dummyJobs = [
            { id: 'job1', title: 'Frontend Developer', company: 'TechCorp' },
            { id: 'job2', title: 'Backend Engineer', company: 'DataSystems' },
            { id: 'job3', title: 'Full Stack Developer', company: 'WebSolutions' },
            { id: 'job4', title: 'UI/UX Designer', company: 'CreativeMinds' }
          ];
          
          dummyJobs.forEach(job => {
            jobIds.push(job.id);
            jobsMap.set(job.id, job);
          });
        }
        
        // Then get all applications for these jobs
        const applicationsRef = collection(db, 'applications');
        const applicationsQuery = query(applicationsRef, where('jobId', 'in', jobIds));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        
        let candidatesData: Candidate[] = [];
        
        applicationsSnapshot.forEach((doc) => {
          const application = { id: doc.id, ...doc.data() } as any;
          const job = jobsMap.get(application.jobId);
          
          candidatesData.push({
            id: doc.id,
            name: application.name,
            email: application.email,
            phone: application.phone,
            skills: application.skills || [],
            education: application.education || [],
            experience: application.experience || [],
            resumeUrl: application.resumeUrl,
            appliedAt: application.appliedAt,
            jobId: application.jobId,
            jobTitle: job?.title || 'Unknown Position',
            company: job?.company || 'Unknown Company'
          });
        });
        
        // Add dummy candidates if none found
        if (candidatesData.length === 0) {
          const dummySkillSets = [
            ['React', 'TypeScript', 'CSS', 'HTML', 'JavaScript'],
            ['Node.js', 'Express', 'MongoDB', 'REST API', 'GraphQL'],
            ['Python', 'Django', 'SQL', 'Data Analysis', 'Machine Learning'],
            ['Java', 'Spring Boot', 'Microservices', 'Docker', 'Kubernetes'],
            ['UI/UX Design', 'Figma', 'Adobe XD', 'User Research', 'Prototyping']
          ];
          
          const dummyCandidates: Candidate[] = [
            {
              id: 'candidate1',
              name: 'Alex Johnson',
              email: 'alex.johnson@example.com',
              phone: '555-123-4567',
              skills: dummySkillSets[0],
              education: [{ degree: 'B.S. Computer Science', school: 'Tech University', year: '2020' }],
              experience: [{ title: 'Frontend Developer', company: 'WebTech Inc.', duration: '2 years' }],
              resumeUrl: 'https://example.com/resume1.pdf',
              appliedAt: new Date().toISOString(),
              jobId: 'job1',
              jobTitle: jobsMap.get('job1')?.title || 'Frontend Developer',
              company: jobsMap.get('job1')?.company || 'TechCorp'
            },
            {
              id: 'candidate2',
              name: 'Sam Rivera',
              email: 'sam.rivera@example.com',
              phone: '555-234-5678',
              skills: dummySkillSets[1],
              education: [{ degree: 'M.S. Software Engineering', school: 'State University', year: '2019' }],
              experience: [{ title: 'Backend Engineer', company: 'ServerLogic', duration: '3 years' }],
              resumeUrl: 'https://example.com/resume2.pdf',
              appliedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
              jobId: 'job2',
              jobTitle: jobsMap.get('job2')?.title || 'Backend Engineer',
              company: jobsMap.get('job2')?.company || 'DataSystems'
            },
            {
              id: 'candidate3',
              name: 'Jordan Lee',
              email: 'jordan.lee@example.com',
              phone: '555-345-6789',
              skills: dummySkillSets[2],
              education: [{ degree: 'B.S. Data Science', school: 'Tech Institute', year: '2021' }],
              experience: [{ title: 'Data Analyst', company: 'DataCorp', duration: '1.5 years' }],
              resumeUrl: 'https://example.com/resume3.pdf',
              appliedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
              jobId: 'job3',
              jobTitle: jobsMap.get('job3')?.title || 'Full Stack Developer',
              company: jobsMap.get('job3')?.company || 'WebSolutions'
            },
            {
              id: 'candidate4',
              name: 'Taylor Smith',
              email: 'taylor.smith@example.com',
              phone: '555-456-7890',
              skills: dummySkillSets[3],
              education: [{ degree: 'B.S. Computer Engineering', school: 'Engineering College', year: '2018' }],
              experience: [{ title: 'DevOps Engineer', company: 'CloudTech', duration: '4 years' }],
              resumeUrl: 'https://example.com/resume4.pdf',
              appliedAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
              jobId: 'job1',
              jobTitle: jobsMap.get('job1')?.title || 'Frontend Developer',
              company: jobsMap.get('job1')?.company || 'TechCorp'
            },
            {
              id: 'candidate5',
              name: 'Morgan Chen',
              email: 'morgan.chen@example.com',
              phone: '555-567-8901',
              skills: dummySkillSets[4],
              education: [{ degree: 'B.A. Design', school: 'Art Institute', year: '2019' }],
              experience: [{ title: 'UI/UX Designer', company: 'DesignStudio', duration: '3 years' }],
              resumeUrl: 'https://example.com/resume5.pdf',
              appliedAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
              jobId: 'job4',
              jobTitle: jobsMap.get('job4')?.title || 'UI/UX Designer',
              company: jobsMap.get('job4')?.company || 'CreativeMinds'
            }
          ];
          
          candidatesData = dummyCandidates;
        }
        
        setAllCandidates(candidatesData);
        setCandidates(candidatesData);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to fetch candidates. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCandidates();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setError(null);

    try {
      // Filter candidates based on search query and skill filter
      const filteredCandidates = allCandidates.filter(candidate => {
        const matchesQuery = !searchQuery.trim() || 
          candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
          candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          candidate.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesSkill = !skillFilter.trim() || 
          (candidate.skills && candidate.skills.some(skill => 
            skill.toLowerCase().includes(skillFilter.toLowerCase())
          ));
        
        return matchesQuery && matchesSkill;
      });
      
      setCandidates(filteredCandidates);
      
      if (filteredCandidates.length === 0 && (searchQuery.trim() || skillFilter.trim())) {
        setError('No candidates found matching your search criteria');
      }
    } catch (err) {
      console.error('Error searching candidates:', err);
      setError('Failed to search candidates. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Find Candidates</h1>

      {/* Search Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search by name or company
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter name or company..."
                  className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <Search size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Filter by skill
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={skillFilter}
                  onChange={(e) => setSkillFilter(e.target.value)}
                  placeholder="Enter skill..."
                  className="w-full p-3 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
                <Filter size={18} className="absolute left-3 top-3.5 text-gray-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              <Search size={20} />
              <span>{isLoading ? 'Searching...' : 'Search'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      )}

      {/* Results */}
      {!isLoading && candidates.length > 0 && (
        <div className="grid gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{candidate.name}</h2>
                  <p className="text-gray-600 dark:text-gray-300">Applied for: {candidate.jobTitle}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Applied on: {new Date(candidate.appliedAt).toLocaleDateString()}
                  </p>
                </div>
                {candidate.resumeUrl && (
                  <a
                    href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-indigo-200 dark:hover:bg-indigo-800 transition-colors"
                  >
                    <span>View Resume</span>
                    <Download size={16} />
                  </a>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {candidate.experience && candidate.experience.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Experience</p>
                    <p className="text-gray-900 dark:text-white">
                      {candidate.experience.map((exp: any, index: number) => (
                        <div key={index} className="mb-1">
                          {exp.title} at {exp.company}
                        </div>
                      ))}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Contact</p>
                  <p className="text-gray-900 dark:text-white">{candidate.phone || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-gray-900 dark:text-white">{candidate.email}</p>
                </div>
                {candidate.skills && candidate.skills.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {candidate.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-md text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <a 
                  href={`/applications?id=${candidate.id}`}
                  className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  View Full Application
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && candidates.length === 0 && !error && searchQuery && (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-gray-400">No candidates found for "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}

export default FindCandidates;
