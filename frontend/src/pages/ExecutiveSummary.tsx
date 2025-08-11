import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const ExecutiveSummary: React.FC = () => {
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Executive Summary</h1>
  //   <p className="text-gray-700">This is the Executive Summary page. Add your content here.</p>
  // </div>
  const { user } = useAuth(); // lấy user từ context
  return (
  <ContentHeader
    title="Executive Summary"
    description="This page provides an overview of the system's key features and functionalities, designed for quick reference by executives."
    storageKey="executiveSummaryHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this context
  />
  );
};

export default ExecutiveSummary; 