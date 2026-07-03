import { forwardRef } from "react";
import { LoaderCircle } from "lucide-react";
import { formatStatusLabel } from "../utils/format";
import { STATUS_TONES } from "../utils/constants";

export const cn = (...values) => values.filter(Boolean).join(" ");

export const buttonStyles = ({ variant = "primary", size = "md", className } = {}) => {
  const variants = {
    primary: "bg-ink text-white hover:bg-cocoa",
    secondary: "bg-white text-ink hover:bg-petal",
    ghost: "bg-transparent text-cocoa hover:bg-white/70",
    accent: "bg-rose/80 text-white hover:bg-rose"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-5 py-3 text-sm",
    lg: "px-6 py-3.5 text-base"
  };

  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold transition duration-200",
    variants[variant],
    sizes[size],
    className
  );
};

export const Button = ({
  children,
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    >
      {children}
    </button>
  );
};

export const Card = ({ children, className }) => <div className={cn("soft-card p-5", className)}>{children}</div>;

export const Input = forwardRef(({ className, ...props }, ref) => (
  <input ref={ref} className={cn("input-shell", className)} {...props} />
));

export const Textarea = forwardRef(({ className, rows = 4, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn("input-shell resize-none", className)} {...props} />
));

export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select ref={ref} className={cn("input-shell appearance-none", className)} {...props}>
    {children}
  </select>
));

export const Checkbox = forwardRef(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="checkbox"
    className={cn("h-4 w-4 rounded border-rose/30 text-ink focus:ring-rose/30", className)}
    {...props}
  />
));

export const Label = ({ children, className }) => (
  <label className={cn("mb-2 block text-sm font-semibold text-cocoa", className)}>{children}</label>
);

export const FieldHint = ({ children }) => <p className="mt-2 text-xs text-cocoa/75">{children}</p>;

export const FieldError = ({ message }) =>
  message ? <p className="mt-2 text-xs font-medium text-rose-600">{message}</p> : null;

export const Badge = ({ children, className }) => (
  <span className={cn("inline-flex items-center rounded-full bg-petal px-3 py-1 text-xs font-semibold text-cocoa", className)}>
    {children}
  </span>
);

export const StatusBadge = ({ value }) => (
  <span
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
      STATUS_TONES[value] ?? "bg-white text-cocoa"
    )}
  >
    {formatStatusLabel(value)}
  </span>
);

export const SectionHeading = ({ eyebrow, title, description, align = "left" }) => (
  <div className={cn("mb-8", align === "center" && "text-center")}>
    {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
    <h2 className="mt-4 text-3xl md:text-4xl">{title}</h2>
    {description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-cocoa/80">{description}</p> : null}
  </div>
);

export const PageHero = ({ eyebrow, title, description, actions, className }) => (
  <section className={cn("section-shell overflow-hidden", className)}>
    <div className="absolute -right-10 top-0 h-40 w-40 rounded-full bg-mint/50 blur-3xl" />
    <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-rose/30 blur-3xl" />
    <div className="relative z-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
        <h1 className="mt-4 text-4xl md:text-5xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-cocoa/80">{description}</p>
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  </section>
);

export const EmptyState = ({ title, description, action }) => (
  <Card className="text-center">
    <h3 className="text-xl">{title}</h3>
    <p className="mt-3 text-sm leading-7 text-cocoa/75">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </Card>
);

export const LoadingBlock = ({ label = "Đang tải dữ liệu..." }) => (
  <div className="flex min-h-[240px] items-center justify-center">
    <div className="flex items-center gap-3 rounded-full bg-white/80 px-5 py-3 text-sm font-semibold text-cocoa shadow-card">
      <LoaderCircle className="h-4 w-4 animate-spin" />
      {label}
    </div>
  </div>
);

export const StatCard = ({ label, value, note }) => (
  <Card className="gradient-ring">
    <p className="text-xs uppercase tracking-[0.22em] text-cocoa/70">{label}</p>
    <div className="mt-4 text-3xl font-display">{value}</div>
    {note ? <p className="mt-2 text-sm text-cocoa/75">{note}</p> : null}
  </Card>
);

export const DataTable = ({ columns, rows, emptyTitle = "Chưa có dữ liệu", emptyDescription = "Thêm mới dữ liệu để bắt đầu.", actions }) => {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="surface-table overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-rose/10 bg-white/70 text-cocoa/75">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-5 py-4 font-semibold">
                {column.label}
              </th>
            ))}
            {actions ? <th className="px-5 py-4 font-semibold">Thao tác</th> : null}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-rose/10 last:border-b-0">
              {columns.map((column) => (
                <td key={`${row.id}-${column.key}`} className="px-5 py-4 align-top text-cocoa/90">
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
              {actions ? <td className="px-5 py-4">{actions(row)}</td> : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
