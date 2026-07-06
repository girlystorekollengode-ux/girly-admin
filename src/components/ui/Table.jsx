import React from 'react';
import { HelpCircle } from 'lucide-react';

const Table = ({ columns, data = [], loading = false, emptyMessage = 'No items found' }) => {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-primary-200 bg-white shadow-pink-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-primary-50 border-b border-primary-200">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={`p-4 text-xs font-bold text-primary uppercase tracking-wider ${
                  col.className || ''
                }`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-primary-100">
          {loading ? (
            // Skeleton loader rows
            Array.from({ length: 5 }).map((_, rIdx) => (
              <tr key={rIdx} className="animate-pulse">
                {columns.map((col, cIdx) => (
                  <td key={cIdx} className="p-4">
                    <div className="h-4 bg-primary-100 rounded-sm w-3/4"></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            // Empty state row
            <tr>
              <td colSpan={columns.length} className="p-8 text-center">
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <HelpCircle size={40} className="mb-2 text-primary" />
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </div>
              </td>
            </tr>
          ) : (
            // Real data rows
            data.map((row, rIdx) => (
              <tr
                key={row._id || rIdx}
                className="hover:bg-primary-50/30 transition-colors"
              >
                {columns.map((col, cIdx) => (
                  <td
                    key={cIdx}
                    className={`p-4 text-sm text-gray-800 whitespace-nowrap ${
                      col.className || ''
                    }`}
                  >
                    {col.cell ? col.cell(row) : row[col.accessor]}
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

export default Table;
