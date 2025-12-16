import {
  Download,
  Share2,
  Trash2,
  Clock,
  FileText
} from 'lucide-react';
import { files } from '../../services/api';

export default function FileList({ filesList, onShareClick, onDelete }) {
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

  const handleDownload = async (file) => {
    try {
      const response = await files.download(file._id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      alert('Download failed');
    }
  };

  /* Empty state */
  if (!filesList.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto mb-4 w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center">
          <FileText size={20} className="text-slate-400" />
        </div>
        <p className="text-sm text-slate-600">
          No files available
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-500">
            <th className="px-6 py-3 font-medium text-left">
              Name
            </th>
            <th className="px-6 py-3 font-medium text-left">
              Type
            </th>
            <th className="px-6 py-3 font-medium text-left">
              Size
            </th>
            <th className="px-6 py-3 font-medium text-left">
              Uploaded
            </th>
            <th className="px-6 py-3 font-medium text-right">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-200">
          {filesList.map((file) => (
            <tr
              key={file._id}
              className="hover:bg-slate-50 transition-colors"
            >
              {/* Name */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText size={18} className="text-slate-400" />
                  <div className="max-w-xs truncate text-slate-900">
                    {file.originalName}
                  </div>
                  {file.compressed && (
                    <span className="text-xs px-2 py-0.5 rounded border border-slate-200 text-slate-600">
                      Compressed
                    </span>
                  )}
                </div>
              </td>

              {/* Type */}
              <td className="px-6 py-4 text-slate-600">
                {file.mimetype}
              </td>

              {/* Size */}
              <td className="px-6 py-4 text-slate-600">
                {formatFileSize(file.size)}
              </td>

              {/* Date */}
              <td className="px-6 py-4 text-slate-600">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  {formatDate(file.uploadDate)}
                </div>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => handleDownload(file)}
                    title="Download"
                    className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Download size={16} />
                  </button>

                  <button
                    onClick={() => onShareClick(file)}
                    title="Share"
                    className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <Share2 size={16} />
                  </button>

                  <button
                    onClick={() => onDelete(file._id)}
                    title="Delete"
                    className="p-2 rounded-md text-slate-600 hover:bg-slate-100 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
