import Link from "next/link";

export default function NotFound() {
  return (
    <div className="ml-56 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl mb-6">🌿</p>
        <h1 className="text-editorial text-primary mb-3">
          Page not found.
        </h1>
        <p className="text-sm text-on-surface-muted mb-8 max-w-xs">
          This path doesn't exist in your sanctuary. Let's get you back.
        </p>
        <Link
          href="/"
          className="gradient-primary text-white px-6 py-3 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}