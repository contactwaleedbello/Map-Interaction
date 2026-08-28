/**
 * Badge — Status indicator component.
 * Follows Kuria component.badge spec: pill shape, semantic color variants.
 *
 * @param {'default'|'primary'|'success'|'warning'|'error'|'info'} variant
 * @param {string} children - Badge text
 * @param {boolean} interactive - If true, renders as clickable button
 * @param {boolean} active - Visual active state
 * @param {function} onClick
 */
export default function Badge({
  variant = 'default',
  children,
  interactive = false,
  active = false,
  onClick,
  className = '',
}) {
  const variantClasses = {
    default: 'bg-kuria-muted text-kuria-text-secondary',
    primary: 'bg-kuria-primary-subtle text-kuria-primary',
    success: 'bg-kuria-success-subtle text-kuria-text-success',
    warning: 'bg-kuria-warning-subtle text-kuria-text-warning',
    error: 'bg-kuria-error-subtle text-kuria-text-error',
    info: 'bg-kuria-info-subtle text-kuria-text-info',
  };

  const activeClasses = {
    default: 'ring-2 ring-kuria-border-strong',
    primary: 'ring-2 ring-kuria-primary',
    success: 'ring-2 ring-kuria-success',
    warning: 'ring-2 ring-kuria-warning',
    error: 'ring-2 ring-kuria-error',
    info: 'ring-2 ring-kuria-info',
  };

  const baseClasses =
    'inline-flex items-center px-2 py-0.5 rounded-kuria-full text-xs font-medium whitespace-nowrap transition-all duration-150';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:opacity-80 active:scale-95'
    : '';

  const Tag = interactive ? 'button' : 'span';

  return (
    <Tag
      type={interactive ? 'button' : undefined}
      onClick={interactive ? onClick : undefined}
      className={`${baseClasses} ${variantClasses[variant]} ${active ? activeClasses[variant] : ''} ${interactiveClasses} ${className}`}
    >
      {children}
    </Tag>
  );
}
