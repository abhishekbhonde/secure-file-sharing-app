import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { files } from '../../services/api';
import FileUpload from '../FileUpload/FileUpload';
import FileList from './FileList';
import ShareModal from '../FileShare/ShareModal';
import { LogOut, Folder } from 'lucide-react';

export default function Dashboard() {
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('my-files');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, logout } = useContext(AuthContext);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const [myFilesRes, sharedFilesRes] = await Promise.all([
        files.getAll(),
        files.getShared()
      ]);
      setMyFiles(myFilesRes.data);
      setSharedFiles(sharedFilesRes.data);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await files.delete(fileId);
      fetchFiles();
    } catch {
      alert('Failed to delete file');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-900 flex items-center justify-center">
              <Folder size={18} className="text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-900">
              File Sharing
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">
              {user?.username}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-sm font-medium
                         text-slate-700 hover:text-slate-900"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Upload */}
        <FileUpload onUploadSuccess={fetchFiles} />

        {/* Files Card */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab('my-files')}
              className={`px-6 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === 'my-files'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              My Files
              <span className="ml-1 text-xs text-slate-400">
                ({myFiles.length})
              </span>
            </button>

            <button
              onClick={() => setActiveTab('shared')}
              className={`px-6 py-3 text-sm font-medium transition-colors
                ${
                  activeTab === 'shared'
                    ? 'border-b-2 border-slate-900 text-slate-900'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              Shared with me
              <span className="ml-1 text-xs text-slate-400">
                ({sharedFiles.length})
              </span>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="py-12 text-center text-sm text-slate-500">
                Loading files…
              </div>
            ) : activeTab === 'my-files' ? (
              <FileList
                filesList={myFiles}
                onShareClick={setSelectedFile}
                onDelete={handleDelete}
              />
            ) : (
              <FileList
                filesList={sharedFiles}
                onShareClick={() => {}}
                onDelete={() => {}}
              />
            )}
          </div>
        </div>
      </main>

      {/* Share Modal */}
      {selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
        />
      )}
    </div>
  );
}
