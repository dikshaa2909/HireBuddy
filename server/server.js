const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// API to get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobsSnapshot = await admin.firestore().collection('jobs').get();
    const jobs = [];
    
    jobsSnapshot.forEach(doc => {
      jobs.push({ id: doc.id, ...doc.data() });
    });
    
    res.json(jobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// API to get applications for HR
app.get('/api/applications/:hrEmail', async (req, res) => {
  try {
    const { hrEmail } = req.params;
    
    // Get jobs posted by this HR
    const jobsSnapshot = await admin.firestore()
      .collection('jobs')
      .where('postedBy', '==', hrEmail)
      .get();
    
    const jobIds = [];
    jobsSnapshot.forEach(doc => {
      jobIds.push(doc.id);
    });
    
    // Get applications for these jobs
    const applications = [];
    
    for (const jobId of jobIds) {
      const applicationsSnapshot = await admin.firestore()
        .collection('applications')
        .where('jobId', '==', jobId)
        .get();
      
      applicationsSnapshot.forEach(doc => {
        applications.push({ id: doc.id, ...doc.data() });
      });
    }
    
    res.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// API to handle new job applications
app.post('/api/applications/new', async (req, res) => {
  try {
    const { applicationId, jobId } = req.body;
    
    if (!applicationId || !jobId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Get the application data
    const applicationRef = admin.firestore().collection('applications').doc(applicationId);
    const applicationDoc = await applicationRef.get();
    
    if (!applicationDoc.exists) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    // Get the job data
    const jobRef = admin.firestore().collection('jobs').doc(jobId);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ error: 'Job not found' });
    }
    
    // Notify HR (in a real app, this would send an email)
    console.log(`New application received for job: ${jobDoc.data().title}`);
    
    res.json({ success: true, message: 'Application processed successfully' });
  } catch (error) {
    console.error('Error processing application:', error);
    res.status(500).json({ error: 'Failed to process application' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});