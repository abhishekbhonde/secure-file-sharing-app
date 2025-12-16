import { useState } from 'react';
import { files } from '../../services/api';
import { Upload, X } from 'lucide-react';

export default function FileUpload({ onUploadSuccess }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [compress, setCompress] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const newFiles = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });
    formData.append('compress', compress);

    try {
      await files.upload(formData);
      setSelectedFiles([]);
      onUploadSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900">
          Upload files
        </h3>
        <p className="text-sm text-slate-600">
          Add files to your workspace
        </p>
      </div>

      {/* Dropzone */}
      <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center">
        <Upload size={32} className="mx-auto text-slate-400 mb-3" />
        <p className="text-sm text-slate-600 mb-2">
          Drag and drop files here, or
        </p>

        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />

        <label
          htmlFor="file-upload"
          className="inline-flex items-center justify-center
                     h-9 px-4 rounded-md border border-slate-300
                     bg-white text-sm font-medium text-slate-900
                     hover:bg-slate-100 cursor-pointer"
        >
          Browse files
        </label>
      </div>

      {/* Selected files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-md
                         border border-slate-200 bg-white px-3 py-2"
            >
              <div className="truncate text-sm text-slate-700">
                {file.name}{' '}
                <span className="text-slate-400">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                onClick={() => handleRemoveFile(index)}
                className="ml-2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compress */}
      <div className="mt-4 flex items-center gap-2">
        <input
          type="checkbox"
          checked={compress}
          onChange={(e) => setCompress(e.target.checked)}
          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
        />
        <span className="text-sm text-slate-700">
          Compress files to save storage space
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Upload button */}
      <div className="mt-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFiles.length || uploading}
          className="w-full h-10 bg-slate-900 text-white text-sm font-medium
                     rounded-md hover:bg-slate-800 transition
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? 'Uploading…'
            : `Upload ${selectedFiles.length} file${
                selectedFiles.length > 1 ? 's' : ''
              }`}
        </button>
      </div>
    </div>
  );
}
