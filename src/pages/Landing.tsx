import { ArrowRight, Users, Brain, FileSearch, FileText, BarChart2, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Connecting Talent with Opportunity
              <span className="text-indigo-600 dark:text-indigo-400"> with AI</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Connects smart students with smarter recruiters. With features like automated screening, AI-driven evaluations, and seamless profile management, it makes hiring faster, fairer, and simpler.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Powerful features designed to make HR-Student management effortless
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: <Users className="h-8 w-8" />,
              title: 'Profile Ranking',
              description: 'Automatically rank and filter candidate profiles based on job requirements',
              link: '/profile-ranks'
            },
            {
              icon: <Brain className="h-8 w-8" />,
              title: 'HR GPT Assistant',
              description: 'AI-powered assistant for all your HR-related queries and tasks',
              link: '/hr-gpt'
            },
            {
              icon: <FileSearch className="h-8 w-8" />,
              title: 'Candidate Search',
              description: 'Find the perfect candidates with our advanced search capabilities',
              link: '/find-candidates'
            },
            {
              icon: <FileText className="h-8 w-8" />,
              title: 'Document Generation',
              description: 'Create professional HR documents with just a few clicks',
              link: '/doc-generation'
            },
            {
              icon: <BarChart2 className="h-8 w-8" />,
              title: 'Analytics Dashboard',
              description: 'Get insights into your recruitment and HR processes',
              link: '/analytics'
            },
            {
              icon: <Inbox className="h-8 w-8" />,
              title: 'Application Management',
              description: 'Efficiently manage and track all job applications',
              link: '/applications'
            }
          ].map((feature, index) => (
            <Link
              key={index}
              to={feature.link}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-gray-700"
            >
              <div className="text-indigo-600 dark:text-indigo-400 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-indigo-600 dark:bg-indigo-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: '95%', label: 'Time Saved in Document Generation' },
              { number: '2x', label: 'Faster Candidate Screening' },
              { number: '24/7', label: 'AI Assistant Availability' }
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Ready to Transform Your HR Operations?
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Join thousands of companies that have streamlined their HR processes with our platform.
        </p>
        <Link
          to="/analytics"
          className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          Start Now
          <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}

export default Landing;