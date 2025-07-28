import React, { useState } from 'react';
import Layout from './components/layout/Layout';
import SectionContent from './components/layout/SectionContent';

const App: React.FC = () => {
  const [activeSection, setActiveSection] = useState('executive');

  return (
    <Layout activeSection={activeSection} setActiveSection={setActiveSection}>
      <SectionContent activeSection={activeSection} />
    </Layout>
  );
};

export default App;