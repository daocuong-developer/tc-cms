import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const ReceivingModule: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Receiving & Returning Module</h1>
  //   <p className="text-gray-700">This is the Receiving & Returning Module page. Add your content here.</p>
  // </div>
  return (
  <ContentHeader
    title="Receiving & Returning Module"
    description="This module handles the processes of receiving and returning items within the system."
    storageKey="receivingModuleHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this context
  />
  );
};

export default ReceivingModule;