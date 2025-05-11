import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Plus, Code, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import SubmissionModal from '../components/SubmissionModal';

type Submission = {
  id: string;
  title: string;
  language: string;
  created_at: string;
  user_id: string;
  user_email: string;
};

const Dashboard: React.FC = () => {
  const [userSubmissions, setUserSubmissions] = useState<Submission[]>([]);
  const [communitySubmissions, setCommunitySubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Submission[] | null>(null);
  const [searching, setSearching] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const { data: allSubmissions, error } = await supabase
          .from('submissions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (allSubmissions) {
          const userSubs = allSubmissions.filter(sub => sub.user_id === user?.id);
          const communitySubs = allSubmissions.filter(sub => sub.user_id !== user?.id);
          setUserSubmissions(userSubs);
          setCommunitySubmissions(communitySubs);
        }
      } catch (error) {
        console.error('Error fetching submissions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user?.id]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .ilike('title', `%${searchQuery.trim()}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching(false);
    }
  };

  const addSubmission = (submission: Submission) => {
    setUserSubmissions([submission, ...userSubmissions]);
  };

  const languageColorMap: Record<string, string> = {
    JavaScript: 'bg-yellow-100 text-yellow-800',
    TypeScript: 'bg-blue-100 text-blue-800',
    Python: 'bg-green-100 text-green-800',
    Java: 'bg-red-100 text-red-800',
    'C#': 'bg-purple-100 text-purple-800',
    Go: 'bg-cyan-100 text-cyan-800',
    Rust: 'bg-orange-100 text-orange-800',
    Ruby: 'bg-pink-100 text-pink-800',
    PHP: 'bg-indigo-100 text-indigo-800',
    default: 'bg-gray-100 text-gray-800'
  };

  const getLanguageColor = (language: string) => {
    return languageColorMap[language] || languageColorMap.default;
  };

  const SubmissionsTable: React.FC<{ submissions: Submission[], title: string }> = ({ submissions, title }) => {
    if (submissions.length === 0) return null;

    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Language
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                {searchResults && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posted By
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/submission/${submission.id}`}
                      className="text-sm font-medium text-purple-600 hover:text-purple-900"
                    >
                      {submission.title}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getLanguageColor(submission.language)}`}>
                      {submission.language}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.created_at), 'MMM d, yyyy HH:mm')}
                  </td>
                  {searchResults && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {submission.user_email}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email}</h1>
            <p className="mt-1 text-sm text-gray-500">View and manage code submissions</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Submission
          </button>
        </div>

        <form onSubmit={handleSearch} className="flex space-x-2 mt-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search code snippets by title..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
          {searchResults && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchResults(null);
              }}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              Clear
            </button>
          )}
        </form>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : searchResults ? (
          searchResults.length > 0 ? (
            <SubmissionsTable 
              submissions={searchResults} 
              title="Search Results" 
            />
          ) : (
            <div className="mt-8 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-4 py-16 sm:px-6 text-center">
                <Code className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No code snippets found</h3>
                <p className="mt-1 text-sm text-gray-500">Try searching with a different title.</p>
              </div>
            </div>
          )
        ) : userSubmissions.length === 0 && communitySubmissions.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-16 sm:px-6 text-center">
              <Code className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions yet</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new code submission.</p>
              <div className="mt-6">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Submission
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <SubmissionsTable 
              submissions={userSubmissions} 
              title="Your Code Submissions" 
            />
            <SubmissionsTable 
              submissions={communitySubmissions} 
              title="Community Submissions" 
            />
          </>
        )}
      </div>

      <SubmissionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={addSubmission}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default Dashboard;