import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Quiz from "../components/Quiz";
import ParticipantList from "../components/ParticipantList";
import Results from "../components/Results";

export default function Room() {
  const { code } = useParams();
  const [room, setRoom] = useState(null);
  const [meId, setMeId] = useState(localStorage.getItem(`me-${code}`));
  const [name, setName] = useState("");
  const [phase, setPhase] = useState("loading");
  const [error, setError] = useState("");

  // Poll the room every 2.5 seconds so we see other people joining/voting in near-realtime
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const r = await fetch(`/.netlify/functions/get-room?code=${code}`).then((r) => r.json());
        if (!alive) return;
        if (r.error) {
          setError(r.error);
          return;
        }
        if (r.room) setRoom(r.room);
      } catch {
        // network blip - ignore, next tick will retry
      }
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code]);

  // Decide which UI phase to show based on room + my participant state
  useEffect(() => {
    if (!room) return;
    if (room.status === "closed" && room.results) {
      setPhase("results");
      return;
    }
    if (!meId) {
      setPhase("join");
      return;
    }
    const me = room.participants.find((p) => p.id === meId);
    if (!me) {
      setPhase("join");
      return;
    }
    setPhase(me.answers ? "waiting" : "quiz");
  }, [room, meId]);

  const join = async () => {
    if (!name.trim()) return;
    const r = await fetch("/.netlify/functions/join-room", {
      method: "POST",
      body: JSON.stringify({ code, displayName: name }),
    }).then((r) => r.json());
    if (r.participantId) {
      localStorage.setItem(`me-${code}`, r.participantId);
      setMeId(r.participantId);
      setRoom(r.room);
    } else if (r.error) {
      setError(r.error);
    }
  };

  const submit = async (answers) => {
    const r = await fetch("/.netlify/functions/submit-vote", {
      method: "POST",
      body: JSON.stringify({ code, participantId: meId, answers }),
    }).then((r) => r.json());
    if (r.room) setRoom(r.room);
  };

  const reveal = async () => {
    const r = await fetch("/.netlify/functions/reveal-results", {
      method: "POST",
      body: JSON.stringify({ code }),
    }).then((r) => r.json());
    if (r.room) setRoom(r.room);
    else if (r.error) setError(r.error);
  };

  if (error && !room) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
        <p className="font-semibold">Couldn't load room {code}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!room) return <p>Loading room {code}…</p>;

  const isHost = room.participants[0]?.id === meId;
  const everyoneVoted =
    room.participants.length > 0 && room.participants.every((p) => p.answers);

  return (
    <div className="space-y-6">
      <RoomHeader code={code} />

      {phase === "join" && (
        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <h2 className="font-semibold">Join this room</h2>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full border rounded-xl px-3 py-2"
          />
          <button
            onClick={join}
            disabled={!name.trim()}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Join room
          </button>
        </div>
      )}

      {phase === "quiz" && <Quiz onComplete={submit} />}

      {phase === "waiting" && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <h2 className="font-semibold">Waiting on the rest of the crew…</h2>
          <ParticipantList room={room} meId={meId} />
          {isHost && (
            <button
              onClick={reveal}
              disabled={room.participants.length < 1}
              className="bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
            >
              {everyoneVoted ? "Reveal results" : "Reveal anyway"}
            </button>
          )}
          {!isHost && (
            <p className="text-xs opacity-60">
              The host will reveal results once everyone has voted.
            </p>
          )}
        </div>
      )}

      {phase === "results" && <Results room={room} />}
    </div>
  );
}

function RoomHeader({ code }) {
  const url = `${window.location.origin}/r/${code}`;
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // older browsers - just ignore
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs opacity-60">Room code</p>
        <p className="font-mono text-2xl tracking-widest">{code}</p>
      </div>
      <button
        onClick={copy}
        className="text-sm border rounded-xl px-3 py-2"
      >
        {copied ? "Copied!" : "Copy invite link"}
      </button>
    </div>
  );
}
