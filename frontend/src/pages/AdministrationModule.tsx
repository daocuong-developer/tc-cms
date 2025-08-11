import ContentHeader from '@/components/common/ContentHeader';
import React from 'react';

const AdministrationModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">System Administration Module</h1>
  //   <p className="text-gray-700">This is the System Administration Module page. Add your content here.</p>
  // </div>
  <ContentHeader
    title="System Administration Module"
    description="This module allows administrators to manage system settings, user roles, and permissions."
    storageKey="administrationModuleHeaderClosed"
  />
);

export default AdministrationModule; 