import React from 'react';
import Modal from './Modal.jsx';
import Button from './Button.jsx';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full text-red-600 mb-4">
          <AlertTriangle size={24} />
        </div>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex items-center justify-center gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading} className="w-full">
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading} className="w-full">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
