import React from 'react';
import { cx } from '../lib/format';

/** Standard page body: consistent gutters, optional title row, and a soft entrance. */
export const Page: React.FC<{
  title?: string;
  description?: React.ReactNode;
  aside?: React.ReactNode;
  fill?: boolean;
  width?: 'full' | 'narrow';
  children: React.ReactNode;
}> = ({ title, description, aside, fill, width = 'full', children }) => (
  <div
    className={cx(
      'p-gutter animate-page-in mx-auto w-full',
      width === 'narrow' ? 'max-w-[760px]' : 'max-w-[1400px]',
      fill && 'h-full flex flex-col min-h-0',
    )}
  >
    {title && (
      <div className="flex items-end justify-between gap-4 mb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted mt-1">{description}</p>}
        </div>
        {aside}
      </div>
    )}
    {children}
  </div>
);
