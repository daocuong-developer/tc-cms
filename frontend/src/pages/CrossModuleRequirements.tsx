import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const CrossModuleRequirements: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Cross-Module Requirements</h1>
  //   <p className="text-gray-700">This is the Cross-Module Requirements page. Add your content here.</p>
  // </div>
  return (
  <ContentHeader
    title="Cross-Module Requirements"
    description="This page outlines the requirements that span across multiple modules, ensuring cohesive functionality."
    storageKey="crossModuleRequirementsHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this context
  />
  );
};

export default CrossModuleRequirements; 