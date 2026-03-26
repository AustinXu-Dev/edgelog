export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-white">Edgelog</h1>
          <p className="text-sm text-gray-500 mt-1">Your personal trading journal</p>
        </div>
        {children}
      </div>
    </div>
  );
}
