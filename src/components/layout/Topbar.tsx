interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white shrink-0">
      <h1 className="text-lg md:text-xl font-semibold text-gray-900 truncate">{title}</h1>
      {actions && <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-3">{actions}</div>}
    </div>
  );
}
