import React, { useState, useEffect } from 'react';
import ToolsGrid from '../components/ToolsGrid';
import Showcase from '../components/Showcase';
import Hero from '../components/Hero'; // 假设有 Hero 组件，如果没有我需要确认一下

const Home = () => {
  const [layoutConfig, setLayoutConfig] = useState({
    showHero: true,
    showShowcase: true,
    showTools: true
  });

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('system_config');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        if (config.layout) {
          setLayoutConfig(config.layout);
        }
      }
    };

    loadConfig();

    // 监听 storage 事件以响应其他标签页的修改（或本页面的直接修改触发的事件）
    window.addEventListener('storage', loadConfig);
    
    // 自定义事件监听，用于同一窗口下的更新
    const handleConfigUpdate = () => loadConfig();
    window.addEventListener('system_config_updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('storage', loadConfig);
      window.removeEventListener('system_config_updated', handleConfigUpdate);
    };
  }, []);

  return (
    <div className="flex-1">
      {layoutConfig.displayHero && <Hero />}
      {layoutConfig.showTools && <ToolsGrid />}
      {layoutConfig.showShowcase && <Showcase />}
    </div>
  );
};

export default Home;
