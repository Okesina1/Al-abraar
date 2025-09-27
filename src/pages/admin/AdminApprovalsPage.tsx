import React, { useState } from 'react';
import { CheckCircle, XCircle, BookOpen, Eye, Download } from 'lucide-react';

export const AdminApprovalsPage: React.FC = () => {
  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: '4',
      fullName: 'Dr. Omar Al-Rashid',
      email: 'omar.rashid@email.com',
      country: 'Egypt',
      city: 'Cairo',
      age: 42,
      phoneNumber: '+20123456789',
      experience: '15 years teaching Islamic studies',
      specialties: ['Qur\'an', 'Tajweed', 'Arabic', 'Fiqh'],
      submittedAt: '2024-01-14T10:30:00Z',
      cvUrl: '/cv/omar-rashid.pdf'
    },
    {
      id: '5',
      fullName: 'Ustadh Yusuf Hassan',
      email: 'yusuf.hassan@email.com',
      country: 'Malaysia',
      city: 'Kuala Lumpur',
      age: 38,
      phoneNumber: '+60123456789',
      experience: '12 years in Islamic education',
      specialties: ['Qur\'an', 'Tajweed', 'Hadeeth'],
      submittedAt: '2024-01-13T15:45:00Z',
      cvUrl: '/cv/yusuf-hassan.pdf'
    },
    {
      id: '6',
      fullName: 'Ustadha Khadija Ali',
      email: 'khadija.ali@email.com',
      country: 'Morocco',
      city: 'Casablanca',
      age: 35,
      phoneNumber: '+212123456789',
      experience: '10 years teaching Qur\'an and Arabic',
      specialties: ['Qur\'an', 'Tajweed', 'Arabic'],
      submittedAt: '2024-01-12T09:20:00Z',
      cvUrl: '/cv/khadija-ali.pdf'
    }
  ]);

  const [selectedUstaadh, setSelectedUstaadh] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const handleApprove = (ustaadhId: string) => {
    setPendingApprovals(prev => prev.filter(u => u.id !== ustaadhId));
    alert('Ustaadh approved successfully! Confirmation email sent.');
  };

  const handleReject = (ustaadhId: string) => {
    setPendingApprovals(prev => prev.filter(u => u.id !== ustaadhId));
    alert('Ustaadh application rejected. Notification email sent.');
  };

  const UstaadhModal = () => {
    if (!selectedUstaadh) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Ustaadh Application</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedUstaadh.fullName}</h3>
                <p className="text-gray-600">{selectedUstaadh.email}</p>
                <p className="text-sm text-gray-500">{selectedUstaadh.city}, {selectedUstaadh.country}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Phone:</span> {selectedUstaadh.phoneNumber}</p>
                    <p><span className="font-medium">Age:</span> {selectedUstaadh.age} years</p>
                    <p><span className="font-medium">Location:</span> {selectedUstaadh.city}, {selectedUstaadh.country}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Experience</h4>
                  <p className="text-sm text-gray-600">{selectedUstaadh.experience}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Specialties</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedUstaadh.specialties.map((specialty: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Application Date</h4>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedUstaadh.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <a
                href={selectedUstaadh.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download CV</span>
              </a>
              <button
                onClick={() => handleApprove(selectedUstaadh.id)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleReject(selectedUstaadh.id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ustaadh Approvals</h1>
        <div className="text-sm text-gray-600">
          {pendingApprovals.length} pending application{pendingApprovals.length !== 1 ? 's' : ''}
        </div>
      </div>

      {pendingApprovals.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <p className="text-gray-600">No pending approvals at this time</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingApprovals.map((ustaadh) => (
            <div key={ustaadh.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BookOpen className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-800">{ustaadh.fullName}</h4>
                    <p className="text-gray-600">{ustaadh.email}</p>
                    <p className="text-sm text-gray-500">{ustaadh.city}, {ustaadh.country}</p>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Experience:</span>
                        <p className="text-gray-600">{ustaadh.experience}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Specialties:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {ustaadh.specialties.slice(0, 3).map((specialty, index) => (
                            <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              {specialty}
                            </span>
                          ))}
                          {ustaadh.specialties.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                              +{ustaadh.specialties.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Submitted: {new Date(ustaadh.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 lg:ml-6">
                  <button
                    onClick={() => {
                      setSelectedUstaadh(ustaadh);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => handleApprove(ustaadh.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <CheckCircle className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => handleReject(ustaadh.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center justify-center space-x-1"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <UstaadhModal />}
    </div>
  );
};