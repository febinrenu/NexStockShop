import React from 'react';
import { AlertCircle, FolderOpen } from 'lucide-react';
import Button from './button';

// --- LoadingState ---
export const LoadingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full h-full min-h-[300px]">
      <svg className="animate-spin h-10 w-10 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
      <p className="text-sm font-medium text-gray-500">Loading data, please wait...</p>
    </div>
  );
};

// --- EmptyState ---
interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No records found',
  description = 'There is currently no data in this view.',
  actionText,
  onAction,
}) => {
  return (
    <div className="text-center py-12 px-4 border-2 border-dashed border-gray-300 rounded-lg max-w-lg mx-auto bg-gray-50 my-6">
      <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-2 text-sm font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <Button onClick={onAction}>{actionText}</Button>
        </div>
      )}
    </div>
  );
};

// --- ErrorState ---
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'An error occurred',
  message = 'We encountered a problem loading this content.',
  onRetry,
}) => {
  return (
    <div className="rounded-md bg-red-50 p-6 border border-red-200 max-w-lg mx-auto my-6 text-center">
      <div className="flex flex-col items-center">
        <AlertCircle className="h-10 w-10 text-red-600 mb-3" />
        <h3 className="text-sm font-semibold text-red-800">{title}</h3>
        <p className="mt-2 text-sm text-red-700">{message}</p>
        {onRetry && (
          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={onRetry}>
              Retry Connection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
