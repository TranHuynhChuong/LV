'use client';

import { useState } from 'react';

type Props = {
  summary: string;
  name: string;
  description?: string;
};
export default function BookInfDescription({ summary, name, description }: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="whitespace-pre-line bg-white rounded-md shadow">
      <div
        className={`overflow-hidden p-4 transition-all duration-300 space-y-4 ${
          expanded ? 'h-fit' : 'h-54'
        }`}
      >
        <h2 className="text-lg font-semibold">Thông tin mô tả</h2>
        <div>
          <h3 className="font-medium ">Tóm tắt</h3>
          <p className="text-sm text-zinc-700">{summary}</p>
        </div>
        <div>
          <h3 className="font-medium ">{name}</h3>
          <p className="text-sm text-zinc-700">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="relative w-full pt-1 pb-4 text-sm text-center cursor-pointer rounded-b-md"
      >
        {expanded ? 'Rút gọn' : 'Xem thêm'}
        {!expanded && (
          <div className="absolute left-0 right-0 z-0 h-12 pointer-events-none bottom-full bg-gradient-to-t from-white to-transparent" />
        )}
      </button>
    </div>
  );
}
