import React, { useState } from 'react';
import { X, FileText, Upload, Download } from 'lucide-react';

interface MaterialsModalProps {
  onClose: () => void;
  canUpload?: boolean;
}

export const MaterialsModal: React.FC<MaterialsModalProps> = ({ onClose, canUpload = false }) => {
  const [files, setFiles] = useState([
    { id: '1', title: 'Lesson 1 Notes', fileType: 'pdf', fileUrl: '#', uploadedAt: '2024-01-10' },
    { id: '2', title: 'Tajweed Rules', fileType: 'pdf', fileUrl: '#', uploadedAt: '2024-01-12' },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles(prev => [
      ...prev,
      { id: Date.now().toString(), title: file.name, fileType: file.type.split('/')[1] || 'file', fileUrl: '#', uploadedAt: new Date().toISOString().slice(0,10) }
    ]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Lesson Materials</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto">
          {files.map(f => (
            <div key={f.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-800">{f.title}</div>
                  <div className="text-xs text-gray-500">{f.fileType.toUpperCase()} • {f.uploadedAt}</div>
                </div>
              </div>
              <a href={f.fileUrl} className="text-green-600 hover:text-green-700 flex items-center space-x-1 text-sm">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </a>
            </div>
          ))}
        </div>

        {canUpload && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Upload className="h-4 w-4" />
              <span>Upload new material</span>
            </div>
            <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
              Choose File
              <input type="file" className="hidden" onChange={handleUpload} />
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
