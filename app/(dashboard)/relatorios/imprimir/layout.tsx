export default function ImprimirLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-card print-area">{children}</div>
}
