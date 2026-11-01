/**
 * Desktop shell route group — isolated chrome from mobile.
 * Pages live under /d/* so mobile and desktop never share layout trees.
 */
export default function DesktopGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
