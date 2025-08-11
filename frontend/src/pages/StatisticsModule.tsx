import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';

const StatisticsModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Statistics & Reporting Module</h1>
  //   <p className="text-gray-700">This is the Statistics & Reporting Module page. Add your content here.</p>
  // </div>
  <ContentHeader
    title="Statistics & Reporting Module"
    description="This module provides insights and reports on system usage, performance, and other metrics."
    storageKey="statisticsModuleHeaderClosed"
  />
);

export default StatisticsModule; 