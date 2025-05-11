import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertCircle, ArrowLeft, ThumbsUp, ThumbsDown, MessageSquare, Pencil, Trash2, CornerDownRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

type Review = {
  id: string;
  comment: string;
  created_at: string;
  user_id: string;
  user_email: string;
};

type Reply = {
  id: string;
  review_id: string;
  parent_id: string | null;
  user_id: string;
  user_email: string;
  comment: string;
  created_at: string;
};

type Vote = {
  review_id: string;
  vote: boolean;
};

type VoteCount = {
  likes: number;
  dislikes: number;
};

type Submission = {
  id: string;
  title: string;
  language: string;
  code: string;
  created_at: string;
  user_id: string;
  user_email: string;
};

const SubmissionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [votes, setVotes] = useState<{ [key: string]: Vote }>({});
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: VoteCount }>({});
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ reviewId: string; parentId: string | null } | null>(null);
  const [newReply, setNewReply] = useState('');
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editComment, setEditComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch submission
        const { data: submissionData, error: submissionError } = await supabase
          .from('submissions')
          .select('id, title, language, code, created_at, user_id, user_email')
          .eq('id', id)
          .single();

        if (submissionError) throw submissionError;
        setSubmission(submissionData);

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select('id, comment, created_at, user_id, user_email')
          .eq('submission_id', id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData);

        // Fetch replies
        const { data: repliesData, error: repliesError } = await supabase
          .from('replies')
          .select('*')
          .eq('review_id', id)
          .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;
        setReplies(repliesData || []);

        // Fetch votes
        if (user) {
          const { data: votesData, error: votesError } = await supabase
            .from('review_votes')
            .select('review_id, vote')
            .eq('user_id', user.id);

          if (votesError) throw votesError;
          const votesMap = (votesData || []).reduce((acc, vote) => ({
            ...acc,
            [vote.review_id]: vote
          }), {});
          setVotes(votesMap);
        }

        // Fetch vote counts
        const { data: voteCountsData, error: voteCountsError } = await supabase
          .from('review_votes')
          .select('review_id, vote');

        if (voteCountsError) throw voteCountsError;
        const counts = (voteCountsData || []).reduce((acc: { [key: string]: VoteCount }, vote) => {
          if (!acc[vote.review_id]) {
            acc[vote.review_id] = { likes: 0, dislikes: 0 };
          }
          if (vote.vote) {
            acc[vote.review_id].likes++;
          } else {
            acc[vote.review_id].dislikes++;
          }
          return acc;
        }, {});
        setVoteCounts(counts);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, user]);

  const handleVote = async (reviewId: string, vote: boolean) => {
    if (!user) return;

    const currentVote = votes[reviewId];
    let action: 'delete' | 'upsert' = 'upsert';
    let newVote = vote;

    if (currentVote) {
      if (currentVote.vote === vote) {
        action = 'delete';
        newVote = !vote;
      }
    }

    try {
      if (action === 'delete') {
        await supabase
          .from('review_votes')
          .delete()
          .eq('review_id', reviewId)
          .eq('user_id', user.id);

        const newVotes = { ...votes };
        delete newVotes[reviewId];
        setVotes(newVotes);
      } else {
        await supabase
          .from('review_votes')
          .upsert({
            review_id: reviewId,
            user_id: user.id,
            vote: newVote
          });

        setVotes({
          ...votes,
          [reviewId]: { review_id: reviewId, vote: newVote }
        });
      }

      // Update vote counts
      const { data: updatedCounts } = await supabase
        .from('review_votes')
        .select('review_id, vote')
        .eq('review_id', reviewId);

      if (updatedCounts) {
        const counts = {
          likes: updatedCounts.filter(v => v.vote).length,
          dislikes: updatedCounts.filter(v => !v.vote).length
        };
        setVoteCounts({ ...voteCounts, [reviewId]: counts });
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .insert([
          {
            submission_id: id,
            user_id: user?.id,
            comment: newComment.trim(),
            user_email: user?.email
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setReviews([data, ...reviews]);
        setNewComment('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !newReply.trim() || !user?.email) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('replies')
        .insert([
          {
            review_id: replyingTo.reviewId,
            parent_id: replyingTo.parentId,
            user_id: user.id,
            user_email: user.email,
            comment: newReply.trim()
          }
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setReplies([...replies, data]);
        setNewReply('');
        setReplyingTo(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    if (!editComment.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('reviews')
        .update({ 
          comment: editComment.trim(),
          user_email: user?.email 
        })
        .eq('id', reviewId)
        .eq('user_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setReviews(reviews.map(review => 
          review.id === reviewId ? data : review
        ));
        setEditingReview(null);
        setEditComment('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateReply = async (replyId: string) => {
    if (!editComment.trim() || !user?.email) return;

    setSubmitting(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('replies')
        .update({
          comment: editComment.trim()
        })
        .eq('id', replyId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setReplies(replies.map(reply =>
          reply.id === replyId ? data : reply
        ));
        setEditingReply(null);
        setEditComment('');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    setError(null);

    try {
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', reviewId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Are you sure you want to delete this reply?')) return;

    setError(null);

    try {
      const { error } = await supabase
        .from('replies')
        .delete()
        .eq('id', replyId)
        .eq('user_id', user?.id);

      if (error) throw error;

      setReplies(replies.filter(reply => reply.id !== replyId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getRepliesForReview = (reviewId: string, parentId: string | null = null): Reply[] => {
    return replies.filter(reply => 
      reply.review_id === reviewId && reply.parent_id === parentId
    );
  };

  const ReplyThread: React.FC<{ 
    reviewId: string, 
    parentId: string | null,
    depth?: number 
  }> = ({ reviewId, parentId, depth = 0 }) => {
    const threadReplies = getRepliesForReview(reviewId, parentId);
    
    if (threadReplies.length === 0) return null;

    return (
      <div className={`ml-${Math.min(depth * 4, 12)} mt-2 space-y-2`}>
        {threadReplies.map(reply => (
          <div key={reply.id} className="relative pl-4 border-l-2 border-gray-200">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{reply.comment}</p>
                  <div className="mt-1 text-xs text-gray-500 flex items-center space-x-2">
                    <span>{reply.user_email}</span>
                    <span>•</span>
                    <span>{format(new Date(reply.created_at), 'MMM d, yyyy HH:mm')}</span>
                  </div>
                </div>
                {user?.id === reply.user_id && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => {
                        setEditingReply(reply.id);
                        setEditComment(reply.comment);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteReply(reply.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {editingReply === reply.id ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingReply(null);
                        setEditComment('');
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleUpdateReply(reply.id)}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  <button
                    onClick={() => setReplyingTo({ reviewId, parentId: reply.id })}
                    className="inline-flex items-center text-xs text-gray-500 hover:text-gray-700"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Reply
                  </button>
                </div>
              )}
              {replyingTo?.parentId === reply.id && (
                <form onSubmit={handleSubmitReply} className="mt-2 space-y-2">
                  <textarea
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                    rows={2}
                  />
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setReplyingTo(null);
                        setNewReply('');
                      }}
                      className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                      Post Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
            <ReplyThread reviewId={reviewId} parentId={reply.id} depth={depth + 1} />
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">Submission not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/dashboard')}
        className="mb-6 inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </button>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{submission.title}</h1>
          <div className="mt-2 flex items-center space-x-4 text-sm">
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${submission.language.toLowerCase()}-100 text-${submission.language.toLowerCase()}-800`}>
              {submission.language}
            </span>
            <span className="text-gray-500">{format(new Date(submission.created_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Posted by: {submission.user_email || 'Unknown User'}
          </p>
        </div>
        
        <div className="px-6 py-4 bg-gray-50">
          <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto font-mono text-sm">
            <code>{submission.code}</code>
          </pre>
        </div>

        <div className="px-6 py-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>

          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmitReview} className="mb-6">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a review..."
              className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              rows={3}
              required
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                  submitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {editingReview === review.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editComment}
                            onChange={(e) => setEditComment(e.target.value)}
                            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                            rows={3}
                            required
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => {
                                setEditingReview(null);
                                setEditComment('');
                              }}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleUpdateReview(review.id)}
                              disabled={submitting}
                              className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 ${
                                submitting ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-900">{review.comment}</p>
                          <div className="mt-1 text-xs text-gray-500">
                            {review.user_email} • {format(new Date(review.created_at), 'MMM d, yyyy HH:mm')}
                          </div>
                        </>
                      )}
                    </div>
                    {user?.id === review.user_id && editingReview !== review.id && (
                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingReview(review.id);
                            setEditComment(review.comment);
                          }}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(review.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleVote(review.id, true)}
                        className={`inline-flex items-center text-sm ${
                          votes[review.id]?.vote === true
                            ? 'text-green-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        <span>{voteCounts[review.id]?.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => handleVote(review.id, false)}
                        className={`inline-flex items-center text-sm ${
                          votes[review.id]?.vote === false
                            ? 'text-red-600'
                            : 'text-gray-400 hover:text-gray-500'
                        }`}
                      >
                        <ThumbsDown className="h-4 w-4 mr-1" />
                        <span>{voteCounts[review.id]?.dislikes || 0}</span>
                      </button>
                    </div>
                    <button
                      onClick={() => setReplyingTo({ reviewId: review.id, parentId: null })}
                      className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </button>
                  </div>

                  {replyingTo?.reviewId === review.id && replyingTo?.parentId === null && (
                    <form onSubmit={handleSubmitReply} className="mt-3 space-y-2">
                      <textarea
                        value={newReply}
                        onChange={(e) => setNewReply(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                        rows={2}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setNewReply('');
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          Post Reply
                        </button>
                      </div>
                    </form>
                  )}

                  <ReplyThread reviewId={review.id} parentId={null} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionDetails;