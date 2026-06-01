export default function AuthShell({
  subtitle,
  children,
}: {
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Hot Spots</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
