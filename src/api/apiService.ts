// src/api/apiService.ts
const API_URL = 'http://localhost:5001/api';

export const fetchJobs = async () => {
  try {
    const response = await fetch(`${API_URL}/jobs`);
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
};

export const fetchApplicationsForHR = async (hrEmail: string) => {
  try {
    const response = await fetch(`${API_URL}/applications/${hrEmail}`);
    if (!response.ok) {
      throw new Error('Failed to fetch applications');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
};