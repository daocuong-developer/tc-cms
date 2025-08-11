import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const LookupModule: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Lookup & Search Module</h1>
  //   <p className="text-gray-700">This is the Lookup & Search Module page. Add your content here.</p>
  // </div>
  return (
  <ContentHeader
    title="Lookup & Search Module"
    description="This module provides functionalities for searching and retrieving data across the system."
    storageKey="lookupModuleHeaderClosed"
    userId={user?.id} // truyền id user
  />
  );
};

export default LookupModule; 