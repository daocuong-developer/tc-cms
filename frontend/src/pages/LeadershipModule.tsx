import React from 'react';
import ContentHeader from '@/components/common/ContentHeader';

const LeadershipModule: React.FC = () => (
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Leadership & Approval Module</h1>
  //   <p className="text-gray-700">This is the Leadership & Approval Module page. Add your content here.</p>
  // </div>
  <ContentHeader
    title="Leadership & Approval Module"
    description="This module facilitates leadership approvals and decision-making processes within the system."
    storageKey="leadershipModuleHeaderClosed"
  />
);

export default LeadershipModule; 