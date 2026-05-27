import React from 'react';

export default function CategoryIcon({ category }) {
  const normalized = (category || '').toLowerCase();
  
  const icons = {
    roads: '🛣️',
    water: '💧',
    electricity: '⚡',
    health: '🏥',
    education: '🏫',
    agriculture: '🌾',
    revenue: '📋',
    welfare: '🤝',
    sanitation: '🧹',
    traffic: '🚦'
  };

  return (
    <span className="text-xl inline-block mr-1.5" role="img" aria-label={category}>
      {icons[normalized] || '📝'}
    </span>
  );
}
