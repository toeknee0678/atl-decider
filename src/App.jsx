import Home from "./pages/Home";

export default function App() {
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-bold text-xl">ATL Decider</h1>
          <span className="text-xs opacity-60">Metro Atlanta</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8">
        <Home />
      </main>
      <footer className="max-w-3xl mx-auto px-4 py-8 text-xs opacity-50">
        Recommendations reference editorial coverage from The Infatuation,
        Eater Atlanta, and Atlanta Magazine. Always linked back to source.
      </footer>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing App */
