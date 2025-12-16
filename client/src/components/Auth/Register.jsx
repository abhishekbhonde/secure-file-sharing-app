import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    setLoading(true);

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 rounded-lg mb-4">
            <FileText className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 mb-2">
            Create your account
          </h1>
          <p className="text-slate-600 text-sm">
            Get started by filling in your details
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
          {error && (
            <div className="flex items-start gap-3 p-3 mb-6 text-sm bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <input
                type="text"
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Your name"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="you@example.com"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Create a password"
                required
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Confirm password
              </label>
              <input
                type="password"
                className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md
                           focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                placeholder="Re-enter your password"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-slate-900 text-white text-sm font-medium rounded-md
                         hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-600">
              Already have an account?{' '}
            </span>
            <a
              href="/login"
              className="text-sm font-medium text-slate-900 hover:underline"
            >
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
