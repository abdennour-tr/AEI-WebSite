import { ArrowRight, Inbox } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, to }) {
  return (
    <div className="portal-empty">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
        <Icon className="h-5 w-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-900">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">{description}</p>
      {actionLabel && to && (
        <Link to={to} className="portal-primary-button mt-5">
          {actionLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
