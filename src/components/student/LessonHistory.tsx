import React, { useState } from 'react';
import { Calendar, Clock, Star, MessageCircle, Video, FileText, Search, Filter } from 'lucide-react';
import { Booking, ScheduleSlot } from '../../types';

interface LessonHistoryProps {
  bookings: Booking[];
  onRateLesson: (bookingId: string, rating: number, comment: string) => void;
}

export const LessonHistory: React.FC<LessonHistoryProps> = ({ bookings, onRateLesson }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<{booking: Booking, slot: ScheduleSlot} | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Get all lesson slots from bookings
  const allLessons = bookings.flatMap(booking => 
    booking.schedule.map(slot => ({
      booking,
      slot,
      ustaadhName: 'Ahmed Al-Hafiz', // In real app, fetch from user data
      packageName: booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package'
    }))
  );

  const filteredLessons = allLessons.filter(lesson => {
    const matchesSearch = lesson.ustaadhName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.packageName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || lesson.slot.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const completedLessons = filteredLessons.filter(l => l.slot.status === 'completed');
  const upcomingLessons = filteredLessons.filter(l => l.slot.status === 'scheduled' && new Date(l.slot.date) >= new Date());
  const missedLessons = filteredLessons.filter(l => l.slot.status === 'missed');

  const handleRateLesson = () => {
    if (selectedLesson && rating > 0) {
      onRateLesson(selectedLesson.booking.id, rating, comment);
      setShowRatingModal(false);
      setSelectedLesson(null);
      setRating(0);
      setComment('');
    }
  };

  const renderStars = (currentRating: number, interactive = false) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 cursor-pointer transition-colors ${
              star <= currentRating
                ? 'text-yellow-500 fill-current'
                : 'text-gray-300'
            }`}
            onClick={interactive ? () => setRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const RatingModal = () => {
    if (!selectedLesson) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Rate Your Lesson</h2>
            <p className="text-gray-600 mt-1">
              {selectedLesson.ustaadhName} • {selectedLesson.packageName}
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
              {renderStars(rating, true)}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleRateLesson}
                disabled={rating === 0}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Rating
              </button>
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedLesson(null);
                  setRating(0);
                  setComment('');
                }}
                className="flex-1 text-gray-600 border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Lessons</p>
              <p className="text-2xl font-bold text-blue-600">{allLessons.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedLessons.length}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-600">{upcomingLessons.length}</p>
            </div>
            <Calendar className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Missed</p>
              <p className="text-2xl font-bold text-red-600">{missedLessons.length}</p>
            </div>
            <Clock className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search lessons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="scheduled">Scheduled</option>
            <option value="cancelled">Cancelled</option>
            <option value="missed">Missed</option>
          </select>

          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredLessons.length} lesson{filteredLessons.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Lessons List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Lesson History</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredLessons.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No lessons found</p>
            </div>
          ) : (
            filteredLessons.map((lesson, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Video className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{lesson.ustaadhName}</h4>
                      <p className="text-gray-600">{lesson.packageName}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(lesson.slot.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{lesson.slot.startTime} - {lesson.slot.endTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lesson.slot.status)}`}>
                      {lesson.slot.status}
                    </span>

                    <div className="flex space-x-2">
                      {lesson.slot.status === 'completed' && (
                        <button
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setShowRatingModal(true);
                          }}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Rate Lesson"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}

                      {lesson.slot.meetingLink && lesson.slot.status === 'scheduled' && (
                        <a
                          href={lesson.slot.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Join Meeting"
                        >
                          <Video className="h-4 w-4" />
                        </a>
                      )}

                      <button
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="View Materials"
                      >
                        <FileText className="h-4 w-4" />
                      </button>

                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Message Ustaadh"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showRatingModal && <RatingModal />}
    </div>
  );
};