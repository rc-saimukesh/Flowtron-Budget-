interface Props {
  icon?: string;
  title: string;
  subtitle?: string;
}

export default function EmptyState({ icon = "🌱", title, subtitle }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="text-4xl mb-4">{icon}</span>
      <p className="text-sm font-semibold text-primary">{title}</p>
      {subtitle && (
        <p className="text-xs text-on-surface-muted mt-1 max-w-xs">{subtitle}</p>
      )}
    </div>
  );
}