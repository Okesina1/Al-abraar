import React, { useState } from 'react';
import { Search, MapPin, Star, BookOpen, MessageCircle, Filter, Clock, Award } from 'lucide-react';
import { BookingModal } from '../../components/booking/BookingModal';
import { MessageCenter } from '../../components/messaging/MessageCenter';
import { User } from '../../types';

export const StudentBrowsePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedUstaadh, setSelectedUstaadh] = useState<User | null>(null);
  const [showMessageCenter, setShowMessageCenter] = useState(false);
  const [messageRecipient, setMessageRecipient] = useState<{id: string, name: string} | null>(null);

  // Mock Ustaadh data
  const ustaadhs: User[] = [
    {
      id: '2',
      email: 'ahmed.alhafiz@email.com',
      fullName: 'Ahmed Al-Hafiz',
      role: 'ustaadh',
      phoneNumber: '+966123456789',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      age: 35,
      isApproved: true,
      createdAt: '2023-01-15T10:00:00Z',
      bio: 'Certified Qur\'an teacher with 15 years of experience. Specializing in Tajweed and Arabic language instruction.',
      experience: '15 years',
      specialties: ['Qur\'an', 'Tajweed', 'Arabic', 'Islamic Studies'],
      rating: 4.9,
      reviewCount: 127,
      isVerified: true,
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '6',
      email: 'fatima.alzahra@email.com',
      fullName: 'Dr. Fatima Al-Zahra',
      role: 'ustaadh',
      phoneNumber: '+20123456789',
      country: 'Egypt',
      city: 'Cairo',
      age: 42,
      isApproved: true,
      createdAt: '2023-02-20T14:30:00Z',
      bio: 'PhD in Islamic Studies with expertise in Hadeeth and Fiqh. Passionate about teaching Islamic principles to students worldwide.',
      experience: '18 years',
      specialties: ['Hadeeth', 'Fiqh', 'Arabic', 'Islamic History'],
      rating: 4.8,
      reviewCount: 89,
      isVerified: true,
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '7',
      email: 'omar.hassan@email.com',
      fullName: 'Ustadh Omar Hassan',
      role: 'ustaadh',
      phoneNumber: '+60123456789',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      age: 38,
      isApproved: true,
      createdAt: '2023-03-10T09:15:00Z',
      bio: 'International Qur\'an competition judge and certified Tajweed instructor. Fluent in English, Arabic, and Malay.',
      experience: '12 years',
      specialties: ['Qur\'an', 'Tajweed', 'Memorization'],
      rating: 4.7,
      reviewCount: 156,
      isVerified: true,
      avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: '8',
      email: 'aisha.rahman@email.com',
      fullName: 'Ustadha Aisha Rahman',
      role: 'ustaadh',
      phoneNumber: '+44123456789',
      country: 'United Kingdom',
      city: 'London',
      age: 29,
      isApproved: true,
      createdAt: '2023-04-05T16:45:00Z',
      bio: 'Young and dynamic teacher specializing in modern Islamic education methods. Expert in connecting with younger students.',
      experience: '8 years',
      specialties: ['Qur\'an', 'Islamic Studies', 'Youth Education'],
      rating: 4.6,
      reviewCount: 73,
      isVerified: true,
      avatar: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ];

  const countries = [...new Set(ustaadhs.map(u => u.country))];

  const filteredUstaadhs = ustaadhs
    .filter(ustaadh => {
      const matchesSearch = ustaadh.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           ustaadh.specialties?.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCountry = !selectedCountry || ustaadh.country === selectedCountry;
      const matchesPackage = !selectedPackage || 
                            (selectedPackage === 'basic' && ustaadh.specialties?.includes('Qur\'an')) ||
                            (selectedPackage === 'complete' && ustaadh.specialties?.includes('Arabic'));
      
      return matchesSearch && matchesCountry && matchesPackage;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'experience':
          return parseInt(b.experience || '0') - parseInt(a.experience || '0');
        default:
          return 0;
      }
    });

  const handleBookUstaadh = (ustaadh: User) => {
    setSelectedUstaadh(ustaadh);
    setShowBookingModal(true);
  };

  const handleMessageUstaadh = (ustaadhId: string, ustaadhName: string) => {
    setMessageRecipient({ id: ustaadhId, name: ustaadhName });
    setShowMessageCenter(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Browse Ustaadhs</h1>
        <div className="text-sm text-gray-600">
          {filteredUstaadhs.length} teacher{filteredUstaadhs.length !== 1 ? 's' : ''} available
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Countries</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>

          <select
            value={selectedPackage}
            onChange={(e) => setSelectedPackage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">All Packages</option>
            <option value="basic">Qur'an & Tajweed</option>
            <option value="complete">Complete Package</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="rating">Sort by Rating</option>
            <option value="reviews">Sort by Reviews</option>
            <option value="experience">Sort by Experience</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredUstaadhs.map((ustaadh) => (
          <div key={ustaadh.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden">
            <div className="p-6">
              <div className="flex items-start space-x-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={ustaadh.avatar}
                    alt={ustaadh.fullName}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  {ustaadh.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Award className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-800 truncate">{ustaadh.fullName}</h3>
                    <div className="flex items-center space-x-1 mt-1 sm:mt-0">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{ustaadh.rating}</span>
                      <span className="text-sm text-gray-500">({ustaadh.reviewCount})</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm truncate">{ustaadh.city}, {ustaadh.country}</span>
                  </div>
                  <div className="flex items-center text-gray-600 mb-3">
                    <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                    <span className="text-sm">{ustaadh.experience} experience</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{ustaadh.bio}</p>

              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {ustaadh.specialties?.map((specialty, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => handleBookUstaadh(ustaadh)}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Book Lesson</span>
                </button>
                <button
                  onClick={() => handleMessageUstaadh(ustaadh.id, ustaadh.fullName)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center space-x-1"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUstaadhs.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">No Ustaadhs found matching your criteria</p>
          <p className="text-gray-500 text-sm">Try adjusting your search filters</p>
        </div>
      )}

      {/* Modals */}
      {showBookingModal && selectedUstaadh && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => {
            setShowBookingModal(false);
            setSelectedUstaadh(null);
          }}
          ustaadh={selectedUstaadh}
        />
      )}

      {showMessageCenter && (
        <MessageCenter
          isOpen={showMessageCenter}
          onClose={() => {
            setShowMessageCenter(false);
            setMessageRecipient(null);
          }}
          recipientId={messageRecipient?.id}
          recipientName={messageRecipient?.name}
        />
      )}
    </div>
  );
};