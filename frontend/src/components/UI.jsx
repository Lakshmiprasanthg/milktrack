export const Card = ({ children, className = '' }) => (
  <div className={`frost-card rounded-[1.5rem] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_28px_70px_rgba(15,23,42,0.12)] md:p-7 ${className}`}>
    {children}
  </div>
);

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'button-base inline-flex items-center justify-center gap-2 px-4 py-2';
  const variants = {
    primary: 'button-primary disabled:opacity-60',
    secondary: 'button-secondary disabled:opacity-60',
    danger: 'button-danger disabled:opacity-60',
    success: 'button-success disabled:opacity-60',
    ghost: 'button-ghost disabled:opacity-60',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {children}
    </button>
  );
};

export const Input = ({
  label,
  type = 'text',
  placeholder,
  error,
  className = '',
  ...props
}) => (
  <div className="flex flex-col gap-2">
    {label && <label className="text-sm font-semibold tracking-wide text-slate-700">{label}</label>}
    <input
      type={type}
      placeholder={placeholder}
      className={`input-surface ${error ? 'border-rose-400/70' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-rose-600 text-sm">{error}</p>}
  </div>
);

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer = null,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-2 sm:px-4 pb-0 sm:pb-0">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-panel-strong relative w-full max-w-xl overflow-hidden rounded-t-[1.75rem] sm:rounded-[1.75rem] max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 shrink-0">
          <div>
            <p className="section-label mb-1">Workspace</p>
            <h2 className="text-lg sm:text-xl font-semibold text-slate-900">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="button-ghost h-10 w-10 rounded-full text-xl text-slate-700 hover:text-slate-900"
          >
            ×
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-5 py-4 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export const Table = ({ columns, data, onEdit, onDelete, onToggle, emptyState }) => {
  return (
    <div className="table-shell overflow-x-auto">
      <table>
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={`${col.key}-${index}`} className="px-4 py-3 sm:px-5 sm:py-4 text-left font-semibold tracking-wide text-slate-100 text-xs sm:text-sm">
                {col.label}
              </th>
            ))}
            <th className="px-4 py-3 sm:px-5 sm:py-4 text-center font-semibold tracking-wide text-slate-100 text-xs sm:text-sm">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="px-4 py-12 text-center text-slate-500">
                {emptyState || (
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--panel-soft)] text-2xl text-[var(--primary)]">
                      ✦
                    </div>
                    <p className="text-base font-semibold text-[var(--text)]">No records yet</p>
                    <p className="text-sm leading-6 text-[var(--text-muted)]">Add the first item to get this workspace moving.</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex} className="border-t border-[var(--border)] transition-colors hover:bg-[var(--panel-soft)]/60">
                {columns.map((col, index) => (
                  <td
                    key={`${row._id}-${col.key}-${index}`}
                    className="px-4 py-3.5 sm:px-5 sm:py-4 text-sm text-slate-700"
                    data-label={col.label}
                  >
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3.5 sm:px-5 sm:py-4" data-label="Actions">
                  <div className="flex justify-center gap-2 flex-wrap">
                    {onToggle && (
                      <button
                        onClick={() => onToggle(row._id)}
                        className="chip chip-info transition-transform duration-150 hover:-translate-y-0.5 hover:opacity-95"
                        style={{ minHeight: '32px' }}
                      >
                        Toggle
                      </button>
                    )}
                    {onEdit && (
                      <button
                        onClick={() => onEdit(row)}
                        className="chip chip-ghost transition-transform duration-150 hover:-translate-y-0.5 hover:bg-slate-100"
                        style={{ minHeight: '32px' }}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row._id)}
                        className="chip chip-warning transition-transform duration-150 hover:-translate-y-0.5 hover:opacity-95"
                        style={{ minHeight: '32px' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export const LoadingScreen = ({
  title = 'Pouring in the details...',
  subtitle = 'Loading the dairy workspace and syncing the freshest data.',
  compact = false,
}) => {
  return (
    <div className={`loading-screen ${compact ? 'loading-screen-compact' : ''}`}>
      <div className="loading-orbit loading-orbit-one" />
      <div className="loading-orbit loading-orbit-two" />
      <div className="loading-orbit loading-orbit-three" />

      <div className="loading-stage glass-panel-strong">
        <div className="vendor-scene">
          <div className="vendor-track" />
          <div className="vendor-cart animate-float">
            <div className="vendor-can"></div>
            <div className="vendor-can vendor-can-back"></div>
            <div className="vendor-body">
              <div className="vendor-hat" />
              <div className="vendor-face" />
              <div className="vendor-shoulder" />
              <div className="vendor-arm vendor-arm-left" />
              <div className="vendor-arm vendor-arm-right" />
            </div>
            <div className="vendor-rod" />
            <div className="vendor-wheel vendor-wheel-left" />
            <div className="vendor-wheel vendor-wheel-right" />
            <div className="vendor-milk-stream" />
            <div className="vendor-splash vendor-splash-one" />
            <div className="vendor-splash vendor-splash-two" />
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="section-label">Loading</p>
          <h2 className="page-title text-2xl sm:text-3xl">{title}</h2>
          <p className="max-w-md text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
          <div className="loading-pips" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
};
