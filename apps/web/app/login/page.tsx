export default function LoginPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-12">
      <h1 className="text-3xl font-semibold">Sign in with GitHub</h1>
      <p className="mt-3 text-slate-600">
        OAuth will use minimal permissions and encrypted token storage. Logged-out users can still copy and download generated output.
      </p>
      <button className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 font-medium text-white">
        Continue with GitHub
      </button>
    </main>
  );
}

