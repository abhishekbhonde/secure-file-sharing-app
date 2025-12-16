import { useState, useEffect } from 'react';
import { share as shareApi, auth } from '../../services/api';
import { X, Copy, Check } from 'lucide-react';

export default function ShareModal({ file, onClose }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [expiresIn, setExpiresIn] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await auth.getUsers();
      setUsers(res.data);
    } catch {
      setError('Failed to load users');
    }
  };

  const toggleUser = (email) => {
    setSelectedUsers((prev) =>
      prev.includes(email)
        ? prev.filter((e) => e !== email)
        : [...prev, email]
    );
  };

  const handleShareWithUsers = async () => {
    if (!selectedUsers.length) return;

    setLoading(true);
    setError('');

    try {
      await shareApi.shareWithUsers({
        fileId: file._id,
        userEmails: selectedUsers,
        expiresInHours: expiresIn || undefined
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Sharing failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError('');

    try {
      const res = await shareApi.generateLink({
        fileId: file._id,
        expiresInHours: expiresIn || undefined
      });
      setShareLink(res.data.shareUrl);
    } catch (err) {
      setError(err.response?.data?.error || 'Link generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-lg border border-slate-200 shadow-lg p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Share file
            </h2>
            <p className="text-sm text-slate-600 mt-1 truncate">
              {file.originalName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            {error}
          </div>
        )}

        {/* Expiration */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Link expiration
          </label>
          <select
            value={expiresIn}
            onChange={(e) => setExpiresIn(e.target.value)}
            className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md
                       focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">Never expires</option>
            <option value="1">1 hour</option>
            <option value="24">24 hours</option>
            <option value="168">7 days</option>
            <option value="720">30 days</option>
          </select>
        </div>

        {/* Share with users */}
        <div className="mb-6">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Share with users
          </p>

          <div className="max-h-44 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 px-4 py-3">
            {!users.length ? (
              <p className="text-sm text-slate-500">
                No users found
              </p>
            ) : (
              users.map((user) => (
                <label
                  key={user._id}
                  className="flex items-center gap-2 py-1 text-sm text-slate-700 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(user.email)}
                    onChange={() => toggleUser(user.email)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  />
                  <span>
                    {user.username}{' '}
                    <span className="text-slate-400">
                      ({user.email})
                    </span>
                  </span>
                </label>
              ))
            )}
          </div>

          <button
            onClick={handleShareWithUsers}
            disabled={!selectedUsers.length || loading}
            className="mt-4 w-full h-10 bg-slate-900 text-white text-sm font-medium
                       rounded-md hover:bg-slate-800 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sharing...' : 'Share with selected users'}
          </button>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-sm font-medium text-slate-700 mb-2">
            Share via link
          </p>

          <button
            onClick={handleGenerateLink}
            disabled={loading}
            className="w-full h-10 bg-slate-100 text-slate-900 text-sm font-medium
                       rounded-md hover:bg-slate-200 transition
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Generating...' : 'Generate link'}
          </button>

          {shareLink && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 h-10 px-3 text-sm border border-slate-300
                           rounded-md bg-slate-50 text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="h-10 w-10 flex items-center justify-center
                           rounded-md border border-slate-300 bg-white
                           hover:bg-slate-100"
                aria-label="Copy link"
              >
                {copied ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <Copy size={16} className="text-slate-600" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
