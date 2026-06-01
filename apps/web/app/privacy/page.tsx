export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-semibold">Privacy</h1>
      <p className="mt-4 leading-7 text-slate-700">
        The product reads public GitHub data by default. Private data is never shown unless a signed-in user explicitly authorizes and selects it. Sensitive profile fields are checked before public export.
      </p>
    </main>
  );
}

