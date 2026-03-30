interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 ${className}`}>
      {title && <h3 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-4">{title}</h3>}
      {children}
    </div>
  );
}
