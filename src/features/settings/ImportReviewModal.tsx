import React from 'react';
import { X, CheckCircle } from 'lucide-react';

interface ImportReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  rowCount: number;
  previewHeaders: string[];
  onConfirm: () => void;
}

export const ImportReviewModal: React.FC<ImportReviewModalProps> = ({
  isOpen,
  onClose,
  fileName,
  rowCount,
  previewHeaders,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Import File Summary</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5"/>
          </button>
        </div>

        <div className="my-4 space-y-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-emerald-500"/>
            <span>File: <strong>{fileName}</strong></span>
          </div>
          <div className="text-sm text-gray-600">
            Rows detected: <strong>{rowCount}</strong>
          </div>
          {previewHeaders.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Columns found:</span>
              <p className="mt-1 truncate">{previewHeaders.join(', ')}</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
          >
            Confirm Import
          </button>
        </div>
      </div>
    </div>
  );
};
