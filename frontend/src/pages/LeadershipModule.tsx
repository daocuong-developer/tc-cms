import React from 'react';
import ContentHeader from '@/components/ui/ContentHeader';
import { useAuth } from '@/contexts/AuthContext';

const LeadershipModule: React.FC = () => {
  const { user } = useAuth(); // lấy user từ context
  // <div>
  //   <h1 className="text-2xl font-bold mb-4">Leadership & Approval Module</h1>
  //   <p className="text-gray-700">This is the Leadership & Approval Module page. Add your content here.</p>
  // </div>
  return (
  <ContentHeader
    title="Leadership & Approval Module"
    description="This module facilitates leadership approvals and decision-making processes within the system."
    storageKey="leadershipModuleHeaderClosed"
    userId={user?.id} // Assuming no specific user ID is needed for this context
  />
);
};

export default LeadershipModule; 