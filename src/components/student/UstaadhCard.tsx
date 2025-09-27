import React from 'react';
import { Star, MapPin, Clock, Award, BookOpen, MessageCircle } from 'lucide-react';
import { User } from '../../types';

interface UstaadhCardProps {
  ustaadh: User;
  onBook: (ustaadh: User) => void;
  onMessage: (ustaadhId: string, ustaadhName: string) => void;
  onViewReviews?: (ustaadh: User) => void;
}

export const UstaadhCard: React.FC<UstaadhCardProps> = ({ ustaadh, onBook, onMessage }) => {
  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
      <div className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
          <div className="relative flex-shrink-0 mx-auto sm:mx-0">
            <img
              src={ustaadh.avatar || `https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
              alt={ustaadh.fullName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
            />
            {ustaadh.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <Award className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">{ustaadh.fullName}</h3>
              <div className="flex items-center justify-center sm:justify-start space-x-1 mt-1 sm:mt-0">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium text-gray-700">{ustaadh.rating}</span>
                <span className="text-sm text-gray-500">({ustaadh.reviewCount})</span>
              </div>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-2">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm truncate">{ustaadh.city}, {ustaadh.country}</span>
            </div>
            
            <div className="flex items-center justify-center sm:justify-start text-gray-600 mb-3">
              <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="text-sm">{ustaadh.experience} experience</span>
            </div>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3 text-center sm:text-left">{ustaadh.bio}</p>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 text-center sm:text-left">Specialties</p>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {ustaadh.specialties?.map((specialty, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-3">
          <button
            onClick={() => onBook(ustaadh)}
            className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <BookOpen className="h-4 w-4" />
            <span>Book Lesson</span>
          </button>
          <button
            onClick={() => onMessage(ustaadh.id, ustaadh.fullName)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Message</span>
          </button>
          {onViewReviews && (
            <button
              onClick={() => onViewReviews(ustaadh)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
            >
              <Star className="h-4 w-4 text-yellow-500" />
              <span>Reviews</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
