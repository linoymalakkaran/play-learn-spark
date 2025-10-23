import React from 'react';
import Layout from '@/components/Layout';

const TestRoute: React.FC = () => {
  return (
    <Layout title="Test Route">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Route Working!</h1>
        <p className="text-gray-600">
          If you can see this page, React Router is working correctly.
        </p>
        <div className="mt-4">
          <p className="text-sm text-gray-500">
            Route: /test-route
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default TestRoute;