export default function ImprimirLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen bg-white print-area">{children}</div>
}
