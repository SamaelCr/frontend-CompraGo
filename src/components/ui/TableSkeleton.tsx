import React from 'react';

interface Props {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({ rows = 5, columns = 4 }: Props) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm animate-pulse">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50">
          <tr>
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-6 py-4">
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="bg-white border-b">
              {Array.from({ length: columns }).map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-slate-200 rounded"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}