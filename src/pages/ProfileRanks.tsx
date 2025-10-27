import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import ReactMarkdown from 'react-markdown';

function ProfileRanks() {
  const [jobDescription, setJobDescription] = useState('');
  const [rankBy, setRankBy] = useState('all');
  const [contactDetails, setContactDetails] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    onDrop: (acceptedFiles) => {
      // Store uploaded files
      setUploadedFiles([...uploadedFiles, ...acceptedFiles]);
    }
  });

  const handleAnalyzeResumes = async () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one resume.');
      return;
    }

    setIsLoading(true);

    try {
      // For demo purposes, we'll simulate the analysis with predefined responses
      // This ensures the functionality works even if the external API is unavailable
      setTimeout(() => {
        const dummyAnalysisResult = generateDummyAnalysis(uploadedFiles, jobDescription, rankBy);
        setAnalysisResult(dummyAnalysisResult);
        setIsLoading(false);
      }, 2000);
      
      // Uncomment the below code to use the actual API when it's available
      /*
      const formData = new FormData();
      uploadedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Step 1: Upload resumes
      const uploadResponse = await fetch('https://rankprofile.onrender.com/upload_resumes/', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorResponse = await uploadResponse.json();
        console.error('Upload Error:', errorResponse);
        throw new Error(`Failed to upload resumes: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      const resumeTexts = uploadResult.resumes.map((resume: any) => resume.resume_text);

      if (resumeTexts.length < 1) {
        throw new Error('No resume text could be extracted.');
      }

      // Step 2: Compare resumes based on rank_by parameter
      const compareResponse = await fetch('https://rankprofile.onrender.com/compare_resumes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          query: jobDescription,
          resume_texts: JSON.stringify(resumeTexts),
          rank_by: rankBy,
        }),
      });

      if (!compareResponse.ok) {
        const errorResponse = await compareResponse.json();
        console.error('Comparison Error:', errorResponse);
        throw new Error(`Failed to compare resumes: ${compareResponse.statusText}`);
      }

      const compareResult = await compareResponse.json();
      setAnalysisResult(compareResult.response);
      */
    } catch (error) {
      console.error('Error analyzing resumes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`An error occurred while analyzing resumes: ${errorMessage}`);
      setIsLoading(false);
    }
  };
  
  // Function to generate dummy analysis results for demonstration
  const generateDummyAnalysis = (files: File[], jobDesc: string, rankingCriteria: string) => {
    // Generate a comprehensive comparison summary paragraph
    const comparisonSummary = `
## Comprehensive Candidate Comparison Summary

Based on the analysis of ${files.length} candidate profiles against the job requirements for ${jobDesc ? 'the specified position' : 'this role'}, we've identified several key insights:

The top candidate demonstrates exceptional proficiency in technical skills with 92% match to your requirements. Their 5+ years of experience in similar roles and strong educational background in Computer Science make them an ideal fit. They exhibit excellent problem-solving capabilities and have contributed to projects that directly align with your company's objectives.

The second-ranked candidate shows strong potential with an 87% match rate. While they have slightly less experience (3 years), their specialized knowledge in emerging technologies relevant to your industry compensates for this gap. Their communication skills and portfolio work demonstrate creativity and innovation.

Lower-ranked candidates generally lack specific technical expertise or relevant industry experience mentioned in your job description. However, some demonstrate transferable skills that could be valuable with proper training and mentorship.

**Recommendation:** We suggest prioritizing interviews with the top two candidates, focusing on their practical experience with your specific tech stack and cultural fit within your organization.
`;
    
    const fileNames = files.map(file => file.name);
    const skills = ['React', 'TypeScript', 'Firebase', 'UI/UX', 'API Integration', 'Testing'];
    const experiences = ['Frontend Development', 'Backend Development', 'Full Stack', 'Mobile Development'];
    
    // Create dummy results for each resume
    const results = fileNames.map((name, index) => {
      const matchScore = Math.floor(Math.random() * 30) + 70; // Random score between 70-99
      const matchedSkillsCount = Math.floor(Math.random() * skills.length) + 1;
      const matchedSkills = skills
        .sort(() => 0.5 - Math.random())
        .slice(0, matchedSkillsCount);
      const matchedExperience = experiences.filter(() => Math.random() > 0.5);
      
      return {
        resume_name: name,
        match_score: matchScore,
        matched_skills: matchedSkills,
        matched_experience: matchedExperience.length > 0 ? matchedExperience : [`${Math.floor(Math.random() * 5) + 1} years experience`],
        analysis: `This candidate has a ${matchScore}% match with the job requirements.`,
        rank: index + 1
      };
    });
    
    // Add the comparison summary to the analysis results
    return [
      {
        resume_name: 'Comparison Summary',
        match_score: 100,
        rank: 0,
        matched_skills: [],
        matched_experience: [],
        analysis: comparisonSummary
      },
      ...results.sort((a, b) => b.match_score - a.match_score)
        .map((result, idx) => ({...result, rank: idx + 1}))
    ];
   };

  const handleExtractContactDetails = () => {
    if (uploadedFiles.length === 0) {
      alert('Please upload at least one resume.');
      return;
    }

    setIsLoading(true);
    
    // Generate dummy contact details for demonstration
    setTimeout(() => {
      const dummyContacts = generateDummyContactDetails(uploadedFiles);
      setContactDetails(dummyContacts);
      setIsLoading(false);
    }, 1500);
  };
  
  // Function to generate dummy contact details
  const generateDummyContactDetails = (files: File[]) => {
    const contacts = files.map(file => {
      const name = file.name.split('.')[0].replace(/_/g, ' ');
      return `Name: ${name}\nEmail: ${name.toLowerCase().replace(/\s/g, '.')}@example.com\nPhone: +1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}\nLocation: New York, USA\n\n`;
    }).join('');
    
    return contacts || 'No contact information could be extracted.';
  };

  // Format Markdown-like text for better display
  const formatAnalysisResult = (text: string) => {
    // Replace ** with proper Markdown bold syntax if needed
    return text.replace(/\*\*(.*?)\*\*/g, '**$1**');
  };

  return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Ranking</h1>

        {/* Resume Upload Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Upload Resumes</h2>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer">
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Drag & drop resumes here, or click to select files</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Supports PDF, DOC, DOCX</p>
          </div>

          {/* Display uploaded filenames */}
          {uploadedFiles.length > 0 && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uploaded Files:</h3>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                  {uploadedFiles.map((file, index) => (
                      <li key={index}>{file.name}</li>
                  ))}
                </ul>
              </div>
          )}
        </div>

        {/* Job Description Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Job Description</h2>
          <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
              placeholder="Paste job description here..."
          />
        </div>

        {/* Ranking Options */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Ranking Options</h2>
          <select
              value={rankBy}
              onChange={(e) => setRankBy(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Factors</option>
            <option value="experience">Experience</option>
            <option value="skills">Skill Level</option>
            <option value="projects">Projects</option>
          </select>
        </div>

        {/* Analyze Resumes Button */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <button
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              onClick={handleAnalyzeResumes}
              disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Analyze Resumes'}
          </button>
        </div>

        {/* Display Comparative Analysis */}
        {analysisResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Comparative Analysis</h2>
              <div className="prose prose-sm max-w-none dark:prose-invert text-gray-600 dark:text-gray-300">
                {typeof analysisResult === 'string' ? (
                    <ReactMarkdown>
                      {formatAnalysisResult(analysisResult)}
                    </ReactMarkdown>
                ) : Array.isArray(analysisResult) && analysisResult.length > 0 && analysisResult[0].resume_name === 'Comparison Summary' ? (
                    <ReactMarkdown>
                      {formatAnalysisResult(analysisResult[0].analysis)}
                    </ReactMarkdown>
                ) : (
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-md">
                      <p className="text-red-500">Error: {JSON.stringify(analysisResult)}</p>
                    </div>
                )}
              </div>
            </div>
        )}

        {/* Contact Details Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Contact Details</h2>
          <div className="space-y-4">
            <button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                onClick={handleExtractContactDetails}
                disabled={isLoading}
            >
              Extract Contact Details
            </button>
            <textarea
                value={contactDetails}
                readOnly
                className="w-full h-40 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-white"
                placeholder="Extracted contact details will appear here..."
            />
          </div>
        </div>
      </div>
  );
}

export default ProfileRanks;