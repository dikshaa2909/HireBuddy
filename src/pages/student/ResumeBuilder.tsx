import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { Save, Download, Plus, Trash2 } from 'lucide-react';

const ResumeBuilder: React.FC = () => {
  const [resumeData, setResumeData] = useState({
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      address: '',
      linkedin: '',
      github: '',
      website: ''
    },
    education: [{ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }],
    experience: [{ company: '', position: '', startDate: '', endDate: '', description: '', location: '' }],
    skills: [''],
    projects: [{ name: '', description: '', technologies: '', link: '' }],
    certifications: [{ name: '', issuer: '', date: '', link: '' }]
  });
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchResumeData = async () => {
      if (!auth.currentUser) return;
      
      try {
        const resumeDoc = await getDoc(doc(db, 'resumes', auth.currentUser.uid));
        if (resumeDoc.exists()) {
          setResumeData(resumeDoc.data() as any);
        }
      } catch (error) {
        console.error('Error fetching resume data:', error);
      }
    };
    
    fetchResumeData();
  }, []);

  const handlePersonalInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setResumeData({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [name]: value
      }
    });
  };

  const handleArrayItemChange = (section: string, index: number, field: string, value: string) => {
    setResumeData({
      ...resumeData,
      [section]: resumeData[section as keyof typeof resumeData].map((item: any, i: number) => 
        i === index ? { ...item, [field]: value } : item
      )
    });
  };

  const handleSkillChange = (index: number, value: string) => {
    const newSkills = [...resumeData.skills];
    newSkills[index] = value;
    setResumeData({
      ...resumeData,
      skills: newSkills
    });
  };

  const addItem = (section: string) => {
    const newItems = [...resumeData[section as keyof typeof resumeData]];
    
    if (section === 'education') {
      newItems.push({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });
    } else if (section === 'experience') {
      newItems.push({ company: '', position: '', startDate: '', endDate: '', description: '', location: '' });
    } else if (section === 'skills') {
      newItems.push('');
    } else if (section === 'projects') {
      newItems.push({ name: '', description: '', technologies: '', link: '' });
    } else if (section === 'certifications') {
      newItems.push({ name: '', issuer: '', date: '', link: '' });
    }
    
    setResumeData({
      ...resumeData,
      [section]: newItems
    });
  };

  const removeItem = (section: string, index: number) => {
    const newItems = [...resumeData[section as keyof typeof resumeData]];
    newItems.splice(index, 1);
    
    // Ensure there's always at least one item
    if (newItems.length === 0) {
      if (section === 'education') {
        newItems.push({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });
      } else if (section === 'experience') {
        newItems.push({ company: '', position: '', startDate: '', endDate: '', description: '', location: '' });
      } else if (section === 'skills') {
        newItems.push('');
      } else if (section === 'projects') {
        newItems.push({ name: '', description: '', technologies: '', link: '' });
      } else if (section === 'certifications') {
        newItems.push({ name: '', issuer: '', date: '', link: '' });
      }
    }
    
    setResumeData({
      ...resumeData,
      [section]: newItems
    });
  };

  const saveResume = async () => {
    if (!auth.currentUser) return;
    
    setSaving(true);
    try {
      await setDoc(doc(db, 'resumes', auth.currentUser.uid), resumeData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const margin = 15;
    let y = margin;
    
    // Personal Info
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(resumeData.personalInfo.name, margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const contactInfo = [
      resumeData.personalInfo.email,
      resumeData.personalInfo.phone,
      resumeData.personalInfo.address,
      resumeData.personalInfo.linkedin,
      resumeData.personalInfo.github,
      resumeData.personalInfo.website
    ].filter(Boolean).join(' | ');
    
    doc.text(contactInfo, margin, y);
    y += 10;
    
    // Education
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Education', margin, y);
    y += 7;
    
    resumeData.education.forEach((edu) => {
      if (edu.institution) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(edu.institution, margin, y);
        y += 5;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const degreeInfo = [
          `${edu.degree} in ${edu.field}`,
          edu.startDate && edu.endDate ? `${edu.startDate} - ${edu.endDate}` : '',
          edu.gpa ? `GPA: ${edu.gpa}` : ''
        ].filter(Boolean).join(' | ');
        
        doc.text(degreeInfo, margin, y);
        y += 7;
      }
    });
    
    // Experience
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Experience', margin, y);
    y += 7;
    
    resumeData.experience.forEach((exp) => {
      if (exp.company) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`${exp.position} at ${exp.company}`, margin, y);
        y += 5;
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'italic');
        const expInfo = [
          exp.location,
          exp.startDate && exp.endDate ? `${exp.startDate} - ${exp.endDate}` : ''
        ].filter(Boolean).join(' | ');
        
        doc.text(expInfo, margin, y);
        y += 5;
        
        doc.setFont('helvetica', 'normal');
        const splitDescription = doc.splitTextToSize(exp.description, 180);
        doc.text(splitDescription, margin, y);
        y += splitDescription.length * 5 + 2;
      }
    });
    
    // Skills
    if (resumeData.skills.some(skill => skill)) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Skills', margin, y);
      y += 7;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const skills = resumeData.skills.filter(Boolean).join(', ');
      const splitSkills = doc.splitTextToSize(skills, 180);
      doc.text(splitSkills, margin, y);
      y += splitSkills.length * 5 + 5;
    }
    
    // Projects
    if (resumeData.projects.some(project => project.name)) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Projects', margin, y);
      y += 7;
      
      resumeData.projects.forEach((project) => {
        if (project.name) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text(project.name, margin, y);
          y += 5;
          
          if (project.technologies) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'italic');
            doc.text(`Technologies: ${project.technologies}`, margin, y);
            y += 5;
          }
          
          if (project.description) {
            doc.setFont('helvetica', 'normal');
            const splitDescription = doc.splitTextToSize(project.description, 180);
            doc.text(splitDescription, margin, y);
            y += splitDescription.length * 5;
          }
          
          if (project.link) {
            doc.setTextColor(0, 0, 255);
            doc.text(`Link: ${project.link}`, margin, y);
            doc.setTextColor(0, 0, 0);
            y += 7;
          } else {
            y += 2;
          }
        }
      });
    }
    
    // Certifications
    if (resumeData.certifications.some(cert => cert.name)) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Certifications', margin, y);
      y += 7;
      
      resumeData.certifications.forEach((cert) => {
        if (cert.name) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(cert.name, margin, y);
          y += 5;
          
          doc.setFont('helvetica', 'normal');
          const certInfo = [
            cert.issuer,
            cert.date
          ].filter(Boolean).join(' | ');
          
          doc.text(certInfo, margin, y);
          
          if (cert.link) {
            y += 5;
            doc.setTextColor(0, 0, 255);
            doc.text(`Link: ${cert.link}`, margin, y);
            doc.setTextColor(0, 0, 0);
          }
          
          y += 7;
        }
      });
    }
    
    doc.save(`${resumeData.personalInfo.name || 'resume'}.pdf`);
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personalInfo':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={resumeData.personalInfo.name}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                  type="email"
                  name="email"
                  value={resumeData.personalInfo.email}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={resumeData.personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                <input
                  type="text"
                  name="address"
                  value={resumeData.personalInfo.address}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={resumeData.personalInfo.linkedin}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub</label>
                <input
                  type="text"
                  name="github"
                  value={resumeData.personalInfo.github}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website</label>
                <input
                  type="text"
                  name="website"
                  value={resumeData.personalInfo.website}
                  onChange={handlePersonalInfoChange}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        );
      
      case 'education':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Education</h3>
              <button
                type="button"
                onClick={() => addItem('education')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            
            {resumeData.education.map((edu, index) => (
              <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Education #{index + 1}</h4>
                  {resumeData.education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('education', index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Institution</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => handleArrayItemChange('education', index, 'institution', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Degree</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => handleArrayItemChange('education', index, 'degree', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Field of Study</label>
                    <input
                      type="text"
                      value={edu.field}
                      onChange={(e) => handleArrayItemChange('education', index, 'field', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">GPA</label>
                    <input
                      type="text"
                      value={edu.gpa}
                      onChange={(e) => handleArrayItemChange('education', index, 'gpa', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                    <input
                      type="text"
                      value={edu.startDate}
                      onChange={(e) => handleArrayItemChange('education', index, 'startDate', e.target.value)}
                      placeholder="MM/YYYY"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                    <input
                      type="text"
                      value={edu.endDate}
                      onChange={(e) => handleArrayItemChange('education', index, 'endDate', e.target.value)}
                      placeholder="MM/YYYY or Present"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'experience':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Work Experience</h3>
              <button
                type="button"
                onClick={() => addItem('experience')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            
            {resumeData.experience.map((exp, index) => (
              <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Experience #{index + 1}</h4>
                  {resumeData.experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('experience', index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => handleArrayItemChange('experience', index, 'company', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Position</label>
                    <input
                      type="text"
                      value={exp.position}
                      onChange={(e) => handleArrayItemChange('experience', index, 'position', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => handleArrayItemChange('experience', index, 'location', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => handleArrayItemChange('experience', index, 'startDate', e.target.value)}
                        placeholder="MM/YYYY"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate}
                        onChange={(e) => handleArrayItemChange('experience', index, 'endDate', e.target.value)}
                        placeholder="MM/YYYY or Present"
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => handleArrayItemChange('experience', index, 'description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'skills':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Skills</h3>
              <button
                type="button"
                onClick={() => addItem('skills')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            
            <div className="space-y-3">
              {resumeData.skills.map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={skill}
                    onChange={(e) => handleSkillChange(index, e.target.value)}
                    placeholder="e.g., JavaScript, Project Management, etc."
                    className="flex-1 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                  {resumeData.skills.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('skills', index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'projects':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Projects</h3>
              <button
                type="button"
                onClick={() => addItem('projects')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            
            {resumeData.projects.map((project, index) => (
              <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Project #{index + 1}</h4>
                  {resumeData.projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('projects', index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Name</label>
                    <input
                      type="text"
                      value={project.name}
                      onChange={(e) => handleArrayItemChange('projects', index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Technologies Used</label>
                    <input
                      type="text"
                      value={project.technologies}
                      onChange={(e) => handleArrayItemChange('projects', index, 'technologies', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Project Link</label>
                  <input
                    type="text"
                    value={project.link}
                    onChange={(e) => handleArrayItemChange('projects', index, 'link', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                  <textarea
                    value={project.description}
                    onChange={(e) => handleArrayItemChange('projects', index, 'description', e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'certifications':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Certifications</h3>
              <button
                type="button"
                onClick={() => addItem('certifications')}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800"
              >
                <Plus size={16} className="mr-1" />
                Add
              </button>
            </div>
            
            {resumeData.certifications.map((cert, index) => (
              <div key={index} className="p-4 border dark:border-gray-700 rounded-lg space-y-4">
                <div className="flex justify-between">
                  <h4 className="font-medium text-gray-700 dark:text-gray-300">Certification #{index + 1}</h4>
                  {resumeData.certifications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem('certifications', index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Certification Name</label>
                    <input
                      type="text"
                      value={cert.name}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'name', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Issuing Organization</label>
                    <input
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'issuer', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input
                      type="text"
                      value={cert.date}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'date', e.target.value)}
                      placeholder="MM/YYYY"
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credential Link</label>
                    <input
                      type="text"
                      value={cert.link}
                      onChange={(e) => handleArrayItemChange('certifications', index, 'link', e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Resume Builder</h1>
        
        <div className="mt-4 md:mt-0 flex space-x-2">
          <button
            type="button"
            onClick={saveResume}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Resume'}
          </button>
          
          <button
            type="button"
            onClick={generatePDF}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Download size={18} className="mr-2" />
            Download PDF
          </button>
        </div>
      </div>
      
      {saved && (
        <div className="bg-green-50 dark:bg-green-900 border-l-4 border-green-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700 dark:text-green-200">
                Resume saved successfully!
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <nav className="space-y-1">
            {['personalInfo', 'education', 'experience', 'skills', 'projects', 'certifications'].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-3 py-2 rounded-md ${
                  activeSection === section
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {section === 'personalInfo'
                  ? 'Personal Information'
                  : section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          {renderSection()}
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;