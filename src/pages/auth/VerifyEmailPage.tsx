import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../../utils/api';
import { Mail, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export const VerifyEmailPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialEmail = params.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email || !code) {
      setError('Enter your email and the 6-digit code');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      setSuccess('Email verified! Redirecting to login...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Enter your email to resend code');
      return;
    }
    setResending(true);
    try {
      await authApi.resendVerification(email);
      setSuccess('A new code has been sent to your email');
    } catch (err: any) {
      setError(err.message || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen py-8 lg:py-12 px-4">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-xl p-6 lg:p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-green-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Verify your email</h2>
          <p className="text-gray-600 mt-1">Enter the 6-digit code sent to your email</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 flex items-start space-x-2">
            <ShieldCheck className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-green-700 text-sm">{success}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-widest text-center text-lg"
              placeholder="------"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
          >
            {loading ? (<><Loader2 className="h-5 w-5 animate-spin mr-2" /> Verifying...</>) : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <button onClick={handleResend} disabled={resending} className="text-green-600 hover:text-green-700 font-medium disabled:opacity-50">
            {resending ? 'Resending...' : 'Resend code'}
          </button>
          <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-gray-800">Back to login</button>
        </div>
      </div>
    </div>
  );
};
