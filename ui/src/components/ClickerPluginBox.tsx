import React, { useEffect, useState } from 'react';
import useClickerStore from '../store/clicker';
import { useServiceStore } from '@dartfrog/puddle';

const ClickerPluginBox: React.FC = () => {
  const { clickMap, sendClick } = useClickerStore();
  const { api, serviceId } = useServiceStore();
  const [sortedClicks, setSortedClicks] = useState<Array<{ id: string, count: number }>>([]);

  useEffect(() => {
    const sorted = Object.entries(clickMap)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count);
    setSortedClicks(sorted);
  }, [clickMap]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        boxSizing: 'border-box',
        padding: '1rem',
      }}
    >
      <button 
        onClick={() => sendClick(api)} 
        style={{ 
          marginBottom: '1rem', 
          padding: '0.5rem 1rem',
          fontSize: '1rem',
          cursor: 'pointer'
        }}
      >
        Click Me!
      </button>
      <div style={{ overflowY: 'auto' }}>
        {sortedClicks.map(({ id, count }) => (
          <div key={id} style={{ marginBottom: '0.5rem' }}>
            <strong>{id || 'Anonymous'}:</strong> {count} {count === 1 ? 'click' : 'clicks'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClickerPluginBox;
