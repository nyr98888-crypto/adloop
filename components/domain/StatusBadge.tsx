export function StatusBadge({
  tone,
  children,
}: {
  tone: "ok" | "warn";
  children: React.ReactNode;
}) {
  const cls =
    tone === "ok"
      ? "bg-brand-ok/15 text-brand-ok"
      : "bg-brand-warn/15 text-brand-warn";
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {children}
    </span>
  );
}
