import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const [hostName, setHostName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const create = async () => {
    if (!hostName.trim()) return;
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/.netlify/functions/create-room", {
        method: "POST",
        body: JSON.stringify({ hostName }),
      }).then((r) => r.json());
      if (!r.code) throw new Error(r.error || "Failed to create room");
      nav(`/r/${r.code}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border p-6">
        <h2 className="text-2xl font-bold mb-2">Can't decide where to go?</h2>
        <p className="text-stone-600 mb-4">
          Answer 5 quick questions with your friends. We'll surface the spots
          ATL critics love that fit everyone's vibe.
        </p>
        <div className="flex gap-2">
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            placeholder="Your name"
            className="flex-1 border rounded-xl px-3 py-2"
          />
          <button
            onClick={create}
            disabled={busy}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {busy ? "Starting…" : "Start a room"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </section>

      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold mb-2">Joining friends?</h3>
        <div className="flex gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            maxLength={6}
            className="flex-1 border rounded-xl px-3 py-2 font-mono tracking-widest"
          />
          <button
            onClick={() => joinCode && nav(`/r/${joinCode}`)}
            className="bg-white border px-4 py-2 rounded-xl"
          >
            Join
          </button>
        </div>
      </section>
    </div>
  );
}
