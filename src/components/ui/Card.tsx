interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className = '', title, action }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">{title}</h3>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
