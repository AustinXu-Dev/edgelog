interface TopbarProps {
  title: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, actions }: TopbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-950">
      <h1 className="text-xl font-semibold text-gray-100">{title}</h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
