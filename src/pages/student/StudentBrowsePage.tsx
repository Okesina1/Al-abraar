import React, { useState } from 'react';
import { Search, MapPin, Star, BookOpen, MessageCircle, Filter, Clock, Award, MessageSquare } from 'lucide-react';
import { BookingModal } from '../../components/booking/BookingModal';
import { MessageCenter } from '../../components/messaging/MessageCenter';
import { UstaadhCard } from '../../components/student/UstaadhCard';
import { ReviewSystem } from '../../components/reviews/ReviewSystem';
import { EmptyState } from '../../components/common/EmptyState';
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
  const [showReviews, setShowReviews] = useState(false);
  const [selectedForReviews, setSelectedForReviews] = useState<User | null>(null);

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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
        {filteredUstaadhs.map((ustaadh) => (
          <UstaadhCard
            key={ustaadh.id}
            ustaadh={ustaadh}
            onBook={handleBookUstaadh}
            onMessage={handleMessageUstaadh}
            onViewReviews={(u)=>{ setSelectedForReviews(u); setShowReviews(true); }}
          />
        ))}
      </div>

      {filteredUstaadhs.length === 0 && (
        <EmptyState
          icon={Search}
          title="No Ustaadhs Found"
          description="No teachers match your current search criteria. Try adjusting your filters or search terms."
        />
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
      {showReviews && selectedForReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-800">Reviews for {selectedForReviews.fullName}</h2>
              </div>
              <button onClick={()=>setShowReviews(false)} className="p-1 hover:bg-gray-100 rounded-full">×</button>
            </div>
            <div className="p-4">
              <ReviewSystem ustaadhId={selectedForReviews.id} canLeaveReview={true} onSubmitReview={()=>alert('Review submitted (mock)')} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
