import React, { useState, useEffect, useRef } from 'react';
import { Send, HelpCircle } from 'lucide-react';

function HrGpt() {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Predefined questions and answers
  const predefinedQA = {
    "What is the hiring process?": "Our hiring process typically includes resume screening, phone interview, technical assessment, in-person interviews, and reference checks before making an offer.",
    "How do I create a job posting?": "You can create a job posting by navigating to the Job Builder page, filling out the required fields, and clicking 'Post Job'.",
    "What are best practices for interviewing candidates?": "Best practices include preparing structured questions, avoiding bias, focusing on skills and experience, taking notes, and providing candidates with clear information about the role and company.",
    "How can I improve employee retention?": "To improve retention, focus on competitive compensation, career development opportunities, work-life balance, recognition programs, and creating a positive company culture.",
    "What are common HR policies?": "Common HR policies include code of conduct, anti-discrimination, leave policies, remote work guidelines, performance evaluation processes, and compensation structures."
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Add user message to chat immediately
    const userMessage = message;
    setChat(prev => [...prev, { role: 'user', content: userMessage }]);
    setMessage('');
    setIsLoading(true);

    try {
      // Check if the message matches any predefined questions
      const predefinedAnswer = predefinedQA[userMessage as keyof typeof predefinedQA];
      
      if (predefinedAnswer) {
        // Use the predefined answer
        setTimeout(() => {
          setChat(prev => [...prev, { 
            role: 'assistant', 
            content: predefinedAnswer
          }]);
          setIsLoading(false);
        }, 1000); // Simulate API delay
      } else {
        // Try the API call if no predefined answer
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
          });
          
          const data = await response.json();
          
          // Add AI response to chat
          setChat(prev => [...prev, { 
            role: 'assistant', 
            content: data.aiResponse // Assuming your backend returns a field named aiResponse
          }]);
        } catch (error) {
          // Fallback response
          setChat(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm here to help with HR-related questions. You can ask me about hiring processes, job postings, interviewing techniques, employee retention, or HR policies."
          }]);
        }
      }
    } catch (error) {
      console.error('Error processing message:', error);
      setChat(prev => [...prev, { 
        role: 'assistant', 
        content: 'Hi, let me know how I can help you with HR-related questions.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col" id="hr-gpt">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">HR GPT Assistant</h1>
      
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {chat.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <HelpCircle size={48} className="text-indigo-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">HR Assistant</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Ask me anything about HR processes, policies, or best practices.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {Object.keys(predefinedQA).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="text-left p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {chat.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-4 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                Thinking...
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="border-t dark:border-gray-700 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask anything about HR policies, procedures, or best practices..."
              className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg transition-colors disabled:bg-indigo-400"
            >
              <Send size={20} />
            </button>
          </div>
          
          {/* Quick Suggestions */}
          {chat.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.keys(predefinedQA).slice(0, 3).map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  {question}
                </button>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function App() {
  const scrollToHrGpt = () => {
    const hrGptSection = document.getElementById('hr-gpt');
    if (hrGptSection) {
      hrGptSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <button
        onClick={scrollToHrGpt}
        className="bg-indigo-600 text-white p-3 rounded-lg fixed bottom-6 right-6 shadow-lg transition-colors hover:bg-indigo-700"
      >
        Take me to HR GPT
      </button>

      <HrGpt />
    </div>
  );
}

export default App;