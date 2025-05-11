import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, Eye, Zap, Users } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <div className="text-center max-w-3xl mx-auto">
          <div className="flex justify-center mb-6">
            <Code2 className="h-16 w-16 text-purple-400" />
          </div>
          <h1 className="text-5xl font-bold mb-6 tracking-tight">
            Review Code. Collaborate Fast.
          </h1>
          <p className="text-xl text-gray-300 mb-10 leading-relaxed">
            Share, review, and collaborate on code snippets with developers in real-time.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 hover:shadow-lg"
          >
            Sign Up to Get Started
          </Link>
        </div>

        <div className="mt-32 grid md:grid-cols-3 gap-12">
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 transform transition-all hover:translate-y-[-8px] hover:shadow-xl">
            <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Code Review</h3>
            <p className="text-gray-300">
              Review code efficiently with with fellow developers.
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 transform transition-all hover:translate-y-[-8px] hover:shadow-xl">
            <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Quick Feedback</h3>
            <p className="text-gray-300">
              Get instant feedback on your code from team members.
            </p>
          </div>
          
          <div className="bg-gray-800 bg-opacity-50 rounded-xl p-8 transform transition-all hover:translate-y-[-8px] hover:shadow-xl">
            <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center mb-6">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
            <p className="text-gray-300">
              Collaborate with your team in a centralized environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;