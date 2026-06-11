import React from 'react';

/**
 * AdminTable component for displaying data in a structured format.
 * 
 * @param {Object} props
 * @param {Array} props.columns - array of { key, label, render?, width? }
 * @param {Array} props.data - array of objects
 * @param {Function} props.onRowClick - callback when a row is clicked
 * @param {boolean} props.loading - whether to show skeleton loading state
 * @param {string} props.emptyMessage - message to show when no data is available
 */
export const AdminTable = ({ 
  columns = [], 
  data = [], 
  onRowClick, 
  loading = false, 
  emptyMessage = "Không có dữ liệu" 
}) => {
  const SkeletonRow = () => (
    <tr className="border-b border-[#dce9ff] animate-pulse">
      {columns.map((_, index) => (
        <td key={index} className="py-3 px-4">
          <div className="h-10 bg-[#e5eeff] rounded"></div>
        </td>
      ))}
    </tr>
  );

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[#d8c3ad]">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead className="bg-[#f1efea] border-b border-[#dce9ff]">
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                className="py-3 px-4 text-[12px] font-medium text-[#534434] uppercase tracking-wider"
                style={col.width ? { width: col.width } : {}}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {loading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : data.length === 0 ? (
            <tr>
              <td 
                colSpan={columns.length} 
                className="py-12 text-center text-[#534434] font-medium"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr 
                key={row.id || rowIndex} 
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b border-[#dce9ff] hover:bg-[#eff4ff] transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="py-3 px-4 text-[14px] text-[#0b1c30]">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
