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
      // Step 1: create the room
      const created = await fetch("/.netlify/functions/create-room", {
        method: "POST",
        body: JSON.stringify({ hostName }),
      }).then((r) => r.json());

      if (!created.code) throw new Error(created.error || "Couldn't create room");

      // Step 2: auto-join the host with the same name (so they don't enter it twice)
      const joined = await fetch("/.netlify/functions/join-room", {
        method: "POST",
        body: JSON.stringify({ code: created.code, displayName: hostName }),
      }).then((r) => r.json());

      if (joined.participantId) {
        // Stash the participant ID so Room.jsx knows who we are
        localStorage.setItem(`me-${created.code}`, joined.participantId);
      }

      nav(`/r/${created.code}`);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  const join = () => {
    if (joinCode.trim().length >= 4) nav(`/r/${joinCode.trim().toUpperCase()}`);
  };

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="bg-white rounded-2xl border p-8">
        <p className="text-xs uppercase tracking-widest opacity-60 mb-2">
          Metro Atlanta · Group decision-maker
        </p>
        <h2 className="text-3xl mb-3">Can't decide where to go?</h2>
        <p className="text-stone-600 mb-6 text-lg">
          Get your friends to answer 5 quick questions. We'll surface the spots
          ATL critics love that fit everyone's vibe.
        </p>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={hostName}
            onChange={(e) => setHostName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && create()}
            placeholder="Your name"
            className="flex-1 border rounded-xl px-3 py-2"
            autoFocus
          />
          <button
            onClick={create}
            disabled={busy || !hostName.trim()}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {busy ? "Starting…" : "Start a room →"}
          </button>
        </div>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </section>

      {/* How it works */}
      <section className="grid sm:grid-cols-3 gap-3">
        <Step n="1" title="Share the room">
          Send your friends a 6-letter code or invite link.
        </Step>
        <Step n="2" title="Everyone votes">
          Each person answers 5 quick questions about vibe, area, and budget.
        </Step>
        <Step n="3" title="Get a real answer">
          We pick the spots that fit the most people, weighted by editorial picks.
        </Step>
      </section>

      {/* Join existing */}
      <section className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold mb-2">Joining friends?</h3>
        <p className="text-stone-600 text-sm mb-4">
          Type the room code your friend shared with you.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="ABC123"
            maxLength={6}
            className="flex-1 border rounded-xl px-3 py-2 font-mono tracking-widest"
          />
          <button
            onClick={join}
            disabled={joinCode.trim().length < 4}
            className="bg-white border px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Join room
          </button>
        </div>
      </section>
    </div>
  );
}

function Step({ n, title, children }) {
  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="text-xs font-bold opacity-50 mb-1">STEP {n}</div>
      <div className="font-semibold mb-1">{title}</div>
      <p className="text-sm text-stone-600">{children}</p>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing the Step component */
