import React from 'react';

interface Props {
  headers: string[];
  children: React.ReactNode;
}

export default function Table({ headers, children }: Props) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
      <table className="w-full text-sm text-left text-slate-500 min-w-[640px]">
        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-6 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}