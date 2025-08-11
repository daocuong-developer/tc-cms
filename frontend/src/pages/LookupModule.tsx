import React from 'react';
import ContentHeader from '@/components/common/ContentHeader';

const LookupModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Lookup & Search Module</h1>
  //   <p className="text-gray-700">This is the Lookup & Search Module page. Add your content here.</p>
  // </div>
  <ContentHeader
    title="Lookup & Search Module"
    description="This module provides functionalities for searching and retrieving data across the system."
    storageKey="lookupModuleHeaderClosed"
  />
);

export default LookupModule; 