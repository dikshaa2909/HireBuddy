import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { CircularProgress, Alert, Box, Card, CardContent, Typography, Button, 
  LinearProgress, Chip, Grid, Paper, Avatar, Divider } from '@mui/material';
import { Clock, CheckCircle, AlertTriangle, RotateCcw, Award, TrendingUp, 
  BookOpen, Brain, User, Calendar, Star } from 'lucide-react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correct_answer: string;
  category: string;
  difficulty: string;
}

interface TestResult {
  id?: string;
  userId: string;
  score: number;
  totalQuestions: number;
  category: string;
  difficulty: string;
  date: Timestamp;
  email?: string;
  questionsAnswered?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  testDuration?: number;
}

// Import questions from data file
import { aptitudeQuestions } from '../../data/aptitudeQuestions';

const AptitudeTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('Programming');
  const [difficulty, setDifficulty] = useState('easy');
  const [previousResults, setPreviousResults] = useState<TestResult[]>([]);
  const [loadingResults, setLoadingResults] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['Programming']);
  const [isMixedTopics, setIsMixedTopics] = useState(false);

  const categories = [
    { id: 'Programming', name: 'Programming' },
    { id: 'Data Structures', name: 'Data Structures' },
    { id: 'Networking', name: 'Networking' },
    { id: 'Mathematics', name: 'Mathematics' },
    { id: 'General Knowledge', name: 'General Knowledge' }
  ];

  const difficulties = [
    { id: 'easy', name: 'Easy' },
    { id: 'medium', name: 'Medium' },
    { id: 'hard', name: 'Hard' }
  ];

  useEffect(() => { fetchPreviousResults(); }, []);

  useEffect(() => {
    if (testStarted && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (testStarted && timeLeft === 0) {
      handleTestSubmit();
    }
  }, [testStarted, timeLeft]);

  const fetchPreviousResults = async () => {
    setLoadingResults(true);
    try {
      if (auth.currentUser) {
        // If user is logged in, try to fetch from Firestore
        const resultsRef = collection(db, 'testResults');
        const q = query(
          resultsRef,
          where('userId', '==', auth.currentUser.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const results: TestResult[] = [];
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as TestResult);
        });
        setPreviousResults(results);
      } else {
        // For demo purposes when not logged in, use localStorage
        const storedResults = JSON.parse(localStorage.getItem('aptitudeResults') || '[]');
        
        // If no stored results, create some dummy history
        if (storedResults.length === 0) {
          const dummyResults: TestResult[] = [
            {
              id: 'result1',
              userId: 'demo-user',
              score: 8,
              totalQuestions: 10,
              category: 'Programming',
              difficulty: 'easy',
              date: Timestamp.fromDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            },
            {
              id: 'result2',
              userId: 'demo-user',
              score: 6,
              totalQuestions: 10,
              category: 'Mathematics',
              difficulty: 'medium',
              date: Timestamp.fromDate(new Date(Date.now() - 14 * 24 * 60 * 60 * 1000))
            },
            {
              id: 'result3',
              userId: 'demo-user',
              score: 9,
              totalQuestions: 10,
              category: 'Data Structures',
              difficulty: 'hard',
              date: Timestamp.fromDate(new Date(Date.now() - 21 * 24 * 60 * 60 * 1000))
            }
          ];
          
          localStorage.setItem('aptitudeResults', JSON.stringify(dummyResults));
          setPreviousResults(dummyResults);
        } else {
          setPreviousResults(storedResults);
        }
      }
    } catch (error) {
      console.error(error);
      setError('Failed to load previous results');
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      let filteredQuestions: Question[] = [];
      
      if (isMixedTopics) {
        // For mixed topics, filter questions from all selected topics with the chosen difficulty
        filteredQuestions = aptitudeQuestions.filter(
          q => selectedTopics.includes(q.category) && q.difficulty === difficulty
        );
      } else {
        // For single topic, use the selected category and difficulty
        filteredQuestions = aptitudeQuestions.filter(
          q => q.category === category && q.difficulty === difficulty
        );
      }
      
      // If we have enough questions, select exactly 10 questions per topic
      if (filteredQuestions.length >= 10) {
        let selectedQuestions: Question[] = [];
        
        if (isMixedTopics) {
          // For mixed topics, ensure we get questions from each selected topic
          const questionsByTopic: Record<string, Question[]> = {};
          
          // Group questions by topic
          selectedTopics.forEach(topic => {
            const topicQuestions = filteredQuestions.filter(q => q.category === topic);
            if (topicQuestions.length > 0) {
              questionsByTopic[topic] = topicQuestions;
            }
          });
          
          // Calculate how many questions to take from each topic
          const questionsPerTopic = Math.floor(10 / Object.keys(questionsByTopic).length);
          let remainingQuestions = 10 - (questionsPerTopic * Object.keys(questionsByTopic).length);
          
          // Take questions from each topic
          Object.keys(questionsByTopic).forEach(topic => {
            const shuffled = [...questionsByTopic[topic]].sort(() => Math.random() - 0.5);
            const numToTake = topic === Object.keys(questionsByTopic)[0] 
              ? questionsPerTopic + remainingQuestions 
              : questionsPerTopic;
            
            selectedQuestions = [...selectedQuestions, ...shuffled.slice(0, numToTake)];
            
            if (topic === Object.keys(questionsByTopic)[0]) {
              remainingQuestions = 0;
            }
          });
        } else {
          // For single topic, take exactly 10 questions
          const shuffled = [...filteredQuestions].sort(() => Math.random() - 0.5);
          selectedQuestions = shuffled.slice(0, 10);
        }
        
        setQuestions(selectedQuestions);
        setTimeLeft(600); // 10 minutes
        setTestStarted(true);
        setTestCompleted(false);
        setCurrentQuestionIndex(0);
        setSelectedAnswers({});
        setScore(0); // Reset score when starting a new test
      } else {
        setError('Not enough questions available for the selected topics and difficulty. Please try another combination.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (questionId: string, answer: string) => {
    setSelectedAnswers({ ...selectedAnswers, [questionId]: answer });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleTestSubmit = async () => {
    setTestStarted(false);
    setTestCompleted(true);
    const correctAnswers = questions.reduce((acc, q) => selectedAnswers[q.id] === q.correct_answer ? acc + 1 : acc, 0);
    setScore(correctAnswers);

    try {
      // Create result object with more detailed information
      const result: TestResult = {
        id: 'result_' + Date.now(),
        userId: auth.currentUser?.uid || 'demo-user',
        score: correctAnswers,
        totalQuestions: questions.length,
        category: isMixedTopics ? selectedTopics.join(', ') : category,
        difficulty: difficulty,
        date: Timestamp.now(),
        // Additional fields for better tracking
        questionsAnswered: Object.keys(selectedAnswers).length,
        testDuration: 600 - timeLeft // in seconds
      };
      
      // Save to Firestore if user is logged in
      if (auth.currentUser) {
        // Add to Firestore collection
        await addDoc(collection(db, 'testResults'), {
          userId: auth.currentUser.uid,
          score: correctAnswers,
          totalQuestions: questions.length,
          category: isMixedTopics ? selectedTopics.join(', ') : category,
          difficulty: difficulty,
          date: Timestamp.now(),
          email: auth.currentUser.email || '',
          questionsAnswered: Object.keys(selectedAnswers).length,
          testDuration: 600 - timeLeft
        });
        console.log('Test result saved to Firebase');
      } else {
        // Save to localStorage if not logged in
        const storedResults = JSON.parse(localStorage.getItem('aptitudeResults') || '[]');
        localStorage.setItem('aptitudeResults', JSON.stringify([result, ...storedResults]));
      }
      
      // Update state with new results
      fetchPreviousResults();
      
      alert('Test completed successfully! Your score: ' + correctAnswers + '/' + questions.length);
    } catch (err) {
      console.error(err);
      setError('Failed to save result.');
    }
  };

  const handleTopicToggle = (topicId: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicId)) {
        return prev.filter(id => id !== topicId);
      } else {
        return [...prev, topicId];
      }
    });
  };

  const renderTestSetup = () => (
    <Card elevation={3} sx={{ borderRadius: 2, overflow: 'visible' }}>
      <Box sx={{ 
        background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)', 
        p: 2, 
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        <BookOpen size={24} color="white" />
        <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
          Start a New Test
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          Select Topics
        </Typography>
        <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {categories.map(cat => (
            <Chip
              key={cat.id}
              label={cat.name}
              clickable
              color={selectedTopics.includes(cat.id) ? "primary" : "default"}
              onClick={() => handleTopicToggle(cat.id)}
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
            Test Mode
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label="Single Topic"
              clickable
              color={!isMixedTopics ? "primary" : "default"}
              onClick={() => setIsMixedTopics(false)}
              icon={<CheckCircle size={16} />}
            />
            <Chip
              label="Mix Topics"
              clickable
              color={isMixedTopics ? "primary" : "default"}
              onClick={() => setIsMixedTopics(true)}
              icon={<TrendingUp size={16} />}
            />
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          {!isMixedTopics && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                Category
              </Typography>
              <Paper elevation={0} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="w-full p-2 bg-transparent border-none outline-none"
                >
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </Paper>
            </Grid>
          )}
          <Grid item xs={12} md={isMixedTopics ? 12 : 6}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
              Difficulty
            </Typography>
            <Paper elevation={0} sx={{ p: 1, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)} 
                className="w-full p-2 bg-transparent border-none outline-none"
              >
                {difficulties.map(diff => (
                  <option key={diff.id} value={diff.id}>
                    {diff.name}
                  </option>
                ))}
              </select>
            </Paper>
          </Grid>
        </Grid>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button 
            variant="contained" 
            onClick={fetchQuestions}
            startIcon={<Brain />}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)',
              boxShadow: '0 3px 5px 2px rgba(99, 102, 241, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4F46E5 30%, #4338CA 90%)',
              }
            }}
          >
            Start Test
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    return (
      <Card elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ 
          background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)', 
          p: 2, 
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Brain size={24} color="white" />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={18} color="white" />
            <Typography variant="body2" sx={{ color: 'white' }}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </Typography>
          </Box>
        </Box>
        
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
              {question.question}
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={(currentQuestionIndex / questions.length) * 100} 
              sx={{ height: 8, borderRadius: 4, mb: 3 }}
            />
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
            {question.options.map(option => (
              <Button
                key={option}
                onClick={() => handleAnswerSelect(question.id, option)}
                variant={selectedAnswers[question.id] === option ? "contained" : "outlined"}
                sx={{
                  p: 2,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  borderRadius: 2,
                  ...(selectedAnswers[question.id] === option ? {
                    background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)',
                  } : {})
                }}
              >
                {option}
              </Button>
            ))}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              onClick={handlePreviousQuestion} 
              disabled={currentQuestionIndex === 0} 
              variant="outlined"
              startIcon={<RotateCcw size={16} />}
              sx={{ borderRadius: 2 }}
            >
              Previous
            </Button>
            
            {currentQuestionIndex === questions.length - 1 ? (
              <Button 
                onClick={handleTestSubmit} 
                variant="contained" 
                color="success"
                endIcon={<CheckCircle size={16} />}
                sx={{ borderRadius: 2 }}
              >
                Submit Test
              </Button>
            ) : (
              <Button 
                onClick={handleNextQuestion} 
                variant="contained"
                sx={{ 
                  borderRadius: 2,
                  background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)',
                }}
              >
                Next Question
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderTestResults = () => (
    <Card elevation={3} sx={{ borderRadius: 2, textAlign: 'center', overflow: 'hidden' }}>
      <Box sx={{ 
        background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)', 
        p: 2, 
        borderRadius: '8px 8px 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1
      }}>
        <Award size={28} color="white" />
        <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
          Test Results
        </Typography>
      </Box>
      
      <CardContent sx={{ p: 4 }}>
        <Box sx={{ 
          width: 150, 
          height: 150, 
          borderRadius: '50%', 
          border: '8px solid',
          borderColor: score/questions.length >= 0.7 ? '#4ADE80' : score/questions.length >= 0.4 ? '#FBBF24' : '#F87171',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          margin: '0 auto 24px auto',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
          background: 'linear-gradient(to bottom, #fafafa, #f5f5f5)'
        }}>
          <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
            {score}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            out of {questions.length}
          </Typography>
          <Box sx={{ 
            position: 'absolute', 
            top: -10, 
            right: -10, 
            bgcolor: score/questions.length >= 0.7 ? '#4ADE80' : score/questions.length >= 0.4 ? '#FBBF24' : '#F87171',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }}>
            <Star size={24} color="white" />
          </Box>
        </Box>
        
        <Typography variant="h5" sx={{ mb: 1, fontWeight: 'bold' }}>
          {score/questions.length >= 0.7 ? 'Excellent!' : score/questions.length >= 0.4 ? 'Good effort!' : 'Keep practicing!'}
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary', fontSize: '1.1rem' }}>
          You scored {Math.round((score / questions.length) * 100)}% on this test
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          <Chip 
            icon={<BookOpen size={16} />} 
            label={category} 
            sx={{ px: 1, py: 0.5, fontSize: '0.9rem' }} 
          />
          <Chip 
            icon={<TrendingUp size={16} />} 
            label={difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} 
            sx={{ px: 1, py: 0.5, fontSize: '0.9rem' }} 
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button 
            variant="contained" 
            onClick={() => setTestCompleted(false)}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)',
              boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #4F46E5 30%, #4338CA 90%)',
                boxShadow: '0 6px 12px rgba(79, 70, 229, 0.4)',
              }
            }}
          >
            Take Another Test
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              // Save result to localStorage for demo
              const newResult = {
                id: `result-${Date.now()}`,
                userId: auth.currentUser?.uid || 'demo-user',
                score: score,
                totalQuestions: questions.length,
                category: category,
                difficulty: difficulty,
                date: Timestamp.fromDate(new Date())
              };
              const storedResults = JSON.parse(localStorage.getItem('aptitudeResults') || '[]');
              localStorage.setItem('aptitudeResults', JSON.stringify([newResult, ...storedResults]));
              setPreviousResults([newResult, ...previousResults]);
              setTestCompleted(false);
            }}
            sx={{ 
              px: 4, 
              py: 1.5, 
              borderRadius: 2,
              borderColor: '#6366F1',
              color: '#6366F1',
              '&:hover': {
                borderColor: '#4F46E5',
                backgroundColor: 'rgba(99, 102, 241, 0.04)',
              }
            }}
          >
            Save & View History
          </Button>
        </Box>
      </CardContent>
    </Card>
  );

  const renderPreviousResults = () => {
    if (loadingResults) {
      return (
        <Card elevation={3} sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
          <CircularProgress size={32} sx={{ color: '#6366F1', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">Loading previous results...</Typography>
        </Card>
      );
    }

    if (previousResults.length === 0) {
      return (
        <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ 
            background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)', 
            p: 2, 
            borderRadius: '8px 8px 0 0',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrendingUp size={20} color="white" />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Test History
            </Typography>
          </Box>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Box sx={{ py: 2 }}>
              <AlertTriangle size={40} color="#f59e0b" style={{ margin: '0 auto 16px' }} />
              <Typography variant="h6" sx={{ mb: 1 }}>No Previous Tests</Typography>
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                You haven't taken any tests yet. Start a new test to see your results here.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card elevation={3} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ 
          background: 'linear-gradient(45deg, #6366F1 30%, #4F46E5 90%)', 
          p: 2, 
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp size={20} color="white" />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Previous Test Results
            </Typography>
          </Box>
          <Chip 
            label={`${previousResults.length} Tests`} 
            size="small"
            sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '& .MuiChip-label': { px: 1 }
            }} 
          />
        </Box>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb' }}>
                <tr>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Difficulty</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {previousResults.map((result) => (
                  <tr key={result.id} style={{ transition: 'background-color 0.2s' }} className="hover:bg-gray-50">
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Calendar size={16} />
                      {result.date.toDate().toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                      {result.category}
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb', color: '#4b5563' }}>
                      <Chip 
                        label={result.difficulty.charAt(0).toUpperCase() + result.difficulty.slice(1)} 
                        size="small"
                        sx={{ 
                          bgcolor: result.difficulty === 'easy' ? '#DCFCE7' : 
                                  result.difficulty === 'medium' ? '#FEF9C3' : '#FEE2E2',
                          color: result.difficulty === 'easy' ? '#166534' : 
                                result.difficulty === 'medium' ? '#854D0E' : '#991B1B',
                          '& .MuiChip-label': { px: 1 }
                        }} 
                      />
                    </td>
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid #e5e7eb' }}>
                      <Chip
                        label={`${result.score}/${result.totalQuestions} (${Math.round((result.score / result.totalQuestions) * 100)}%)`}
                        size="small"
                        sx={{ 
                          bgcolor: (result.score / result.totalQuestions) >= 0.7 ? '#DCFCE7' : 
                                  (result.score / result.totalQuestions) >= 0.4 ? '#FEF9C3' : '#FEE2E2',
                          color: (result.score / result.totalQuestions) >= 0.7 ? '#166534' : 
                                (result.score / result.totalQuestions) >= 0.4 ? '#854D0E' : '#991B1B',
                          '& .MuiChip-label': { px: 1 }
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Aptitude Tests</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {!testStarted && !testCompleted && renderTestSetup()}
          {testStarted && renderQuestion()}
          {testCompleted && renderTestResults()}
        </div>
        <div>{renderPreviousResults()}</div>
      </div>
      {error && <Alert severity="error">{error}</Alert>}
    </div>
  );
};

export default AptitudeTest;
