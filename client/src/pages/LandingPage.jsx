import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/upload');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <h1 className="text-5xl font-bold text-gray-900 mb-4">Thread Up</h1>
              <p className="text-xl text-gray-600 mb-2">Your AI-Powered Virtual Wardrobe</p>
              <p className="text-gray-500">
                Upload your clothes, get AI-generated outfit suggestions, and never wonder what to
                wear again.
              </p>
            </div>

            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Upload Your Clothes</h3>
                    <p className="text-sm text-gray-600">
                      Simply take photos of your wardrobe items and upload them.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">AI Analysis</h3>
                    <p className="text-sm text-gray-600">
                      Our AI identifies categories, colors, and patterns automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <svg
                    className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-gray-900">Get Outfit Ideas</h3>
                    <p className="text-sm text-gray-600">
                      Receive personalized outfit combinations for any occasion.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sign In */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Get Started</h2>
              <div className="flex justify-center">
                <GoogleSignInButton />
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
