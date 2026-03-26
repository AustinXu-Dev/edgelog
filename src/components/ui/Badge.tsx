interface BadgeProps {
  label: string;
  color?: string;
  onRemove?: () => void;
}

export function Badge({ label, color = '#6366f1', onRemove }: BadgeProps) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: color + '33', color, border: `1px solid ${color}55` }}
    >
      {label}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 hover:opacity-75 transition-opacity"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
