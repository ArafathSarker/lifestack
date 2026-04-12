import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  action?: ReactNode;
}

export default function Card({ title, children, className = '', hoverable = false, action }: CardProps) {
  return (
    <div className={`card-elevated p-6 ${hoverable ? 'hover-lift cursor-pointer' : ''} ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
