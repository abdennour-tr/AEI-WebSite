import { createElement } from "react";

export default function PageHeader({
  eyebrow = "Portail étudiant",
  title,
  description,
  icon,
  children,
}) {
  return (
    <header className="relative isolate overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-200/70 sm:px-8 sm:py-9">
      <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-sky-300">
            {icon && (
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-cyan-300">
                {createElement(icon, { className: "h-4 w-4" })}
              </span>
            )}
            {eyebrow}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              {description}
            </p>
          )}
        </div>
        {children && <div className="relative shrink-0">{children}</div>}
      </div>
    </header>
  );
}
