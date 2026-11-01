/**
 * Mobile shell route group — isolated chrome from desktop.
 * Pages live under /m/* so mobile and desktop never share layout trees.
 */
export default function MobileGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
