import { Link } from 'react-router-dom';
import { Home } from 'lucide-react'; // Import the Home icon from Lucide

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-6">
            <div className="text-center">
                {/* 404 Heading */}
                <h1 className="text-9xl font-bold text-indigo-600 dark:text-indigo-400">404</h1>
                <p className="text-2xl font-semibold mt-4">Page Not Found</p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    The page you're looking for doesn't exist or has been moved.
                </p>

                {/* Back to Home Button */}
                <Link
                    to="/"
                    className="mt-6 inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                    <Home size={20} className="mr-2" />
                    <span>Go Back Home</span>
                </Link>
            </div>
        </div>
    );
};

export default NotFound;