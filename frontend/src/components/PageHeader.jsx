export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div><h1 className="text-2xl font-semibold text-zinc-950">{title}</h1>{subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}</div>
      {action}
    </div>
  );
}
