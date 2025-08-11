import ContentHeader from '@/components/common/ContentHeader';
import React from 'react';

const BackofficeModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Back-office Processing Module</h1>
  //   <p className="text-gray-700">This is the Back-office Processing Module page. Add your content here.</p>
  // </div>

  <ContentHeader
    title="Back-office Processing Module"
    description="This module handles all back-office processing tasks, including data management and reporting."
    storageKey="backofficeModuleHeaderClosed"
  />
);

export default BackofficeModule; 