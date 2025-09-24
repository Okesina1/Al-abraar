import React, { useState } from 'react';
import { Users, Search, MessageCircle, Calendar, Star, TrendingUp, Clock, BookOpen } from 'lucide-react';
import { Booking } from '../../types';

interface StudentManagementProps {
  bookings: Booking[];
  onMessageStudent: (studentId: string, studentName: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({ bookings, onMessageStudent }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showStudentModal, setShowStudentModal] = useState(false);

  // Transform bookings into student data
  const students = bookings.map(booking => ({
    id: booking.studentId,
    name: 'Student Name', // In real app, fetch from user data
    email: 'student@email.com',
    bookingId: booking.id,
    package: booking.packageType === 'basic' ? 'Qur\'an & Tajweed' : 'Complete Package',
    startDate: booking.startDate,
    endDate: booking.endDate,
    totalLessons: booking.schedule.length,
    completedLessons: booking.schedule.filter(s => s.status === 'completed').length,
    upcomingLessons: booking.schedule.filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date()).length,
    progress: Math.round((booking.schedule.filter(s => s.status === 'completed').length / booking.schedule.length) * 100),
    lastLesson: booking.schedule
      .filter(s => s.status === 'completed')
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || null,
    nextLesson: booking.schedule
      .filter(s => s.status === 'scheduled' && new Date(s.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]?.date || null,
    status: booking.status,
    hoursPerWeek: booking.hoursPerDay * booking.daysPerWeek
  }));

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || student.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const activeStudents = students.filter(s => s.status === 'confirmed').length;
  const totalLessonsCompleted = students.reduce((sum, s) => sum + s.completedLessons, 0);
  const averageProgress = Math.round(students.reduce((sum, s) => sum + s.progress, 0) / students.length);

  const StudentModal = () => {
    if (!selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">Student Details</h2>
              <button 
                onClick={() => setShowStudentModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedStudent.name}</h3>
                <p className="text-gray-600">{selectedStudent.email}</p>
                <p className="text-sm text-gray-500">Booking #{selectedStudent.bookingId}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Course Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Package:</span> {selectedStudent.package}</p>
                    <p><span className="font-medium">Hours per Week:</span> {selectedStudent.hoursPerWeek}</p>
                    <p><span className="font-medium">Start Date:</span> {selectedStudent.startDate}</p>
                    <p><span className="font-medium">End Date:</span> {selectedStudent.endDate}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Progress</span>
                      <span className="font-medium">{selectedStudent.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedStudent.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Lesson Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Total Lessons:</span> {selectedStudent.totalLessons}</p>
                    <p><span className="font-medium">Completed:</span> {selectedStudent.completedLessons}</p>
                    <p><span className="font-medium">Upcoming:</span> {selectedStudent.upcomingLessons}</p>
                    <p><span className="font-medium">Last Lesson:</span> {selectedStudent.lastLesson || 'None'}</p>
                    <p><span className="font-medium">Next Lesson:</span> {selectedStudent.nextLesson || 'None'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Status</h4>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStudent.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                    selectedStudent.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedStudent.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => onMessageStudent(selectedStudent.id, selectedStudent.name)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Message Student</span>
              </button>
              <button className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                View Schedule
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
              <p className="text-sm text-gray-600 mb-1">Active Students</p>
              <p className="text-2xl font-bold text-blue-600">{activeStudents}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
              <p className="text-2xl font-bold text-green-600">{totalLessonsCompleted}</p>
            </div>
            <BookOpen className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Progress</p>
              <p className="text-2xl font-bold text-yellow-600">{averageProgress}%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">This Week's Lessons</p>
              <p className="text-2xl font-bold text-purple-600">
                {students.reduce((sum, s) => sum + s.upcomingLessons, 0)}
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-600" />
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
              placeholder="Search students..."
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
            <option value="confirmed">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-600">
              {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-xl shadow-md">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">My Students</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {filteredStudents.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No students found</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div key={student.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{student.name}</h4>
                      <p className="text-gray-600">{student.package}</p>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Clock className="h-4 w-4" />
                          <span>{student.hoursPerWeek}h/week</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span>Next: {student.nextLesson || 'None'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Progress</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${student.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-800">{student.progress}%</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <p className="text-sm text-gray-600">Lessons</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {student.completedLessons}/{student.totalLessons}
                      </p>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(student);
                          setShowStudentModal(true);
                        }}
                        className="px-3 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors text-sm"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => onMessageStudent(student.id, student.name)}
                        className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center space-x-1"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>Message</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showStudentModal && <StudentModal />}
    </div>
  );
};