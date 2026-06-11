import React from 'react';

/**
 * KpiCard component for displaying key performance indicators.
 * 
 * @param {Object} props
 * @param {string} props.label - Descriptor of the metric
 * @param {string|number} props.value - Main value to display
 * @param {string|number} props.trend - Trend value (e.g. "+12%")
 * @param {string} props.trendType - 'up' | 'down' | 'neutral'
 */
export const KpiCard = ({ label, value, trend, trendType = 'neutral' }) => {
  const getTrendStyles = () => {
    switch (trendType) {
      case 'up':
        return {
          container: 'text-[#16a34a] bg-[#16a34a]/10',
          icon: 'trending_up'
        };
      case 'down':
        return {
          container: 'text-red-600 bg-red-50',
          icon: 'trending_down'
        };
      case 'neutral':
      default:
        return {
          container: 'text-[#534434] bg-[#d8c3ad]/30',
          icon: 'horizontal_rule'
        };
    }
  };

  const trendStyles = getTrendStyles();

  return (
    <div className="bg-white rounded-lg border border-[#d8c3ad] p-4 relative overflow-hidden group hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.1)] transition-shadow duration-300">
      <p className="text-[12px] font-medium text-[#534434] uppercase tracking-wider mb-2">
        {label}
      </p>
      <div className="flex items-end justify-between mt-1">
        <span className="text-[30px] font-bold leading-[38px] text-[#213145]">
          {value}
        </span>
        {trend && (
          <div className={`flex items-center px-2 py-1 rounded text-[11px] font-bold ${trendStyles.container}`}>
            <span className="material-symbols-outlined text-[14px]">
              {trendStyles.icon}
            </span>
            <span className="ml-1">{trend}</span>
          </div>
        )}
      </div>
    </div>
  );
};
