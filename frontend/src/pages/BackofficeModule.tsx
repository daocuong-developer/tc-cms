import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

const BackofficeModule: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Back-office Processing Module</h1>
  //   <p className="text-gray-700">This is the Back-office Processing Module page. Add your content here.</p>
  // </div>
return (
  <ContentHeader
    title="Back-office Processing Module"
    description="This module handles all back-office processing tasks, including data management and reporting."
    storageKey="backofficeModuleHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this module
  />
  );
};

export default BackofficeModule; 