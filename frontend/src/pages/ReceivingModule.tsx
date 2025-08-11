import React from 'react';
import ContentHeader from '@/components/common/ContentHeader';

const ReceivingModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Receiving & Returning Module</h1>
  //   <p className="text-gray-700">This is the Receiving & Returning Module page. Add your content here.</p>
  // </div>
  <ContentHeader
    title="Receiving & Returning Module"
    description="This module handles the processes of receiving and returning items within the system."
    storageKey="receivingModuleHeaderClosed"
  />
);

export default ReceivingModule; 