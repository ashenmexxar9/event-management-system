import React, { useEffect, useState } from 'react';
import { Star, Edit2, Trash2, Plus, X } from 'lucide-react';
import { eventService, feedbackService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Event, Feedback } from '../types';
import { Card, Button } from '../components/Common';

const StarRating: React.FC<{ rating: number; onRate?: (rating: number) => void; readOnly?: boolean }> = ({
  rating,
  onRate,
  readOnly = false
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readOnly && onRate?.(star)}
          onMouseEnter={() => !readOnly && setHoverRating(star)}
          onMouseLeave={() => !readOnly && setHoverRating(0)}
          disabled={readOnly}
          className={`${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
        >
          <Star
            className={`w-5 h-5 ${
              (hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [userFeedback, setUserFeedback] = useState<Feedback | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editingFeedback, setEditingFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      loadFeedbackData();
    }
  }, [selectedEventId]);

  const loadEvents = async () => {
    try {
      const response = await eventService.getAll();
      setEvents(response.data);
      if (response.data.length > 0) {
        setSelectedEventId(response.data[0].id);
      }
    } catch (error: any) {
      addToast('Failed to load events', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFeedbackData = async () => {
    try {
      setIsLoading(true);
      
      if (user?.role === 'ADMIN') {
        const feedbackResponse = await feedbackService.getAll(selectedEventId);
        setFeedbacks(feedbackResponse.data || []);

        const statsResponse = await feedbackService.getStats(selectedEventId);
        setStats(statsResponse.data);
      } else {
        const feedbackResponse = await feedbackService.getByUser(selectedEventId);
        setUserFeedback(feedbackResponse.data);
      }
    } catch (error: any) {
      addToast('Failed to load feedback data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    try {
      if (!selectedRating) {
        addToast('Please select a rating', 'error');
        return;
      }

      if (editingFeedback) {
        await feedbackService.update(selectedEventId, editingFeedback.id, {
          rating: selectedRating,
          comment: comment,
        });
        addToast('Feedback updated successfully', 'success');
      } else {
        await feedbackService.create(selectedEventId, {
          rating: selectedRating,
          comment: comment,
        });
        addToast('Feedback submitted successfully', 'success');
      }

      setIsModalOpen(false);
      setSelectedRating(0);
      setComment('');
      setEditingFeedback(null);
      loadFeedbackData();
    } catch (error: any) {
      addToast(error.response?.data?.error || 'Operation failed', 'error');
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await feedbackService.delete(selectedEventId, feedbackId);
      addToast('Feedback deleted successfully', 'success');
      loadFeedbackData();
    } catch (error: any) {
      addToast('Delete failed', 'error');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading...</p></div>;
  }

  if (events.length === 0) {
    return (
      <Card title="No Events">
        <p className="text-gray-500">Create an event first to manage feedback</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Event Feedback</h1>
        <p className="text-gray-500 mt-1">
          {user?.role === 'ADMIN' ? 'View guest feedback for your events' : 'Share your feedback about events'}
        </p>
      </div>

      <Card title="Select Event">
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({event.date})
            </option>
          ))}
        </select>
      </Card>

      {/* Admin View */}
      {user?.role === 'ADMIN' && (
        <>
          {stats && (
            <Card title="Feedback Summary">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <p className="text-gray-500 text-sm">Total Feedbacks</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_feedbacks}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">Average Rating</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.average_rating ? stats.average_rating.toFixed(1) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">5 Stars</p>
                  <p className="text-lg font-bold text-yellow-500">{stats.five_star}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">4 Stars</p>
                  <p className="text-lg font-bold text-yellow-500">{stats.four_star}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">3 Stars & Below</p>
                  <p className="text-lg font-bold text-orange-500">{stats.three_star + stats.two_star + stats.one_star}</p>
                </div>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-gray-900">
              Guest Feedback ({feedbacks.length})
            </h2>
          </div>

          {feedbacks.length === 0 ? (
            <Card>
              <p className="text-gray-500 text-center py-8">No feedback received yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {feedbacks.map((feedback) => (
                <Card key={feedback.id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{feedback.user_name}</p>
                          <p className="text-sm text-gray-500">{feedback.user_email}</p>
                        </div>
                        <StarRating rating={feedback.rating} readOnly />
                      </div>
                      {feedback.comment && (
                        <p className="text-gray-700 mt-2">{feedback.comment}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(feedback.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteFeedback(feedback.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* User View */}
      {user?.role === 'USER' && (
        <>
          {userFeedback ? (
            <Card title="Your Feedback">
              <div className="space-y-4">
                <div>
                  <p className="text-gray-500 text-sm mb-2">Your Rating</p>
                  <StarRating rating={userFeedback.rating} readOnly />
                </div>
                {userFeedback.comment && (
                  <div>
                    <p className="text-gray-500 text-sm mb-2">Your Comment</p>
                    <p className="text-gray-700">{userFeedback.comment}</p>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Submitted on {new Date(userFeedback.created_at || '').toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setEditingFeedback(userFeedback);
                    setSelectedRating(userFeedback.rating);
                    setComment(userFeedback.comment || '');
                    setIsModalOpen(true);
                  }}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Feedback
                  </Button>
                  <Button
                    onClick={() => handleDeleteFeedback(userFeedback.id)}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Feedback
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">You haven't submitted feedback for this event yet</p>
                <Button onClick={() => {
                  setEditingFeedback(null);
                  setSelectedRating(0);
                  setComment('');
                  setIsModalOpen(true);
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Submit Feedback
                </Button>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Feedback Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFeedback ? 'Edit Your Feedback' : 'Submit Feedback'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingFeedback(null);
                  setSelectedRating(0);
                  setComment('');
                }}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you rate this event? *
                </label>
                <StarRating
                  rating={selectedRating}
                  onRate={(rating) => setSelectedRating(rating)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comments
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your thoughts about the event..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingFeedback(null);
                    setSelectedRating(0);
                    setComment('');
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  {editingFeedback ? 'Update' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
