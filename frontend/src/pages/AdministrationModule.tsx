import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

const AdministrationModule: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  

  return (
    <ContentHeader
      title="System Administration Module"
      description="This module allows administrators to manage system settings, user roles, and permissions."
      storageKey="administrationModuleHeaderClosed"
      userId={user?.id} // truyền id user
    />
  );
};

export default AdministrationModule;
