import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const TechnicalConsiderations: React.FC = () => {
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Technical Considerations</h1>
  //   <p className="text-gray-700">This is the Technical Considerations page. Add your content here.</p>
  // </div>
  const { user } = useAuth(); // lấy user từ context
  return (
  <ContentHeader
    title="Technical Considerations"
    description="This page discusses the technical aspects and considerations for the system's architecture and implementation."
    storageKey="technicalConsiderationsHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this context
  />
);
};

export default TechnicalConsiderations; 