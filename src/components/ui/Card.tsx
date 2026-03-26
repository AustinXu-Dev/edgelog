interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export function Card({ children, className = '', title }: CardProps) {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl p-4 ${className}`}>
      {title && <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{title}</h3>}
      {children}
    </div>
  );
}
