import React from 'react';
import ToolsGrid from '../components/ToolsGrid';
import Showcase from '../components/Showcase';

const Home = () => {
  return (
    <div className="flex-1">
      <ToolsGrid />
      <Showcase />
    </div>
  );
};

export default Home;
