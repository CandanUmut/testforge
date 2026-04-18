import { Link } from 'react-router-dom';
import { Zap, ArrowLeft } from 'lucide-react';
import { getAppPath, PUBLIC_ROUTES } from '../lib/routes';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-200 mb-6">
          <Zap className="w-8 h-8 text-indigo-600" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-2">Page not found</p>
        <p className="text-gray-400 text-sm mb-8 max-w-sm">
          This page doesn't exist or was moved. Head back to the dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to={PUBLIC_ROUTES.landing} className="btn-secondary flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <Link to={getAppPath('demo')} className="btn-primary">
            Go to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
