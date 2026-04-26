import { useEffect, useMemo, useState } from "react";
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
  const [hostStartedQuiz, setHostStartedQuiz] = useState(
    () => localStorage.getItem(`started-${code}`) === "1"
  );

  // Poll the room every 2.5 seconds for near-realtime feel
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
        // network blip — next tick will retry
      }
    };
    tick();
    const id = setInterval(tick, 2500);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [code]);

  // Decide which UI phase to show
  useEffect(() => {
    if (!room) return;

    // Results are out — everyone (including non-voters) sees them
    if (room.status === "closed" && room.results) {
      setPhase("results");
      return;
    }

    // Not yet a participant — show join screen
    if (!meId) {
      setPhase("join");
      return;
    }

    const me = room.participants.find((p) => p.id === meId);
    if (!me) {
      setPhase("join");
      return;
    }

    // Host hasn't yet started the quiz — show lobby (only the host sees this)
    const isHost = room.participants[0]?.id === meId;
    if (isHost && !hostStartedQuiz && !me.answers) {
      setPhase("lobby");
      return;
    }

    setPhase(me.answers ? "waiting" : "quiz");
  }, [room, meId, hostStartedQuiz]);

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

  const startQuiz = () => {
    localStorage.setItem(`started-${code}`, "1");
    setHostStartedQuiz(true);
  };

  if (error && !room) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-2xl p-6">
        <p className="font-semibold mb-1">Couldn't load room {code}</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (!room) return <SkeletonRoom code={code} />;

  const isHost = room.participants[0]?.id === meId;
  const totalVoters = room.participants.length;
  const votedCount = room.participants.filter((p) => p.answers).length;
  const everyoneVoted = totalVoters > 0 && votedCount === totalVoters;

  return (
    <div className="space-y-6">
      <RoomHeader code={code} room={room} />

      {phase === "join" && (
        <div className="bg-white border rounded-2xl p-6 space-y-3">
          <h2>Join this room</h2>
          <p className="text-stone-600 text-sm">
            {room.hostName ? `${room.hostName} is waiting on you` : "Tell us your name to get started"}
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && join()}
            placeholder="Your name"
            className="w-full border rounded-xl px-3 py-2"
            autoFocus
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

      {phase === "lobby" && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div>
            <h2>Waiting for your crew</h2>
            <p className="text-stone-600 text-sm mt-1">
              Share the code above. When everyone's joined, start the quiz.
            </p>
          </div>
          <ParticipantList room={room} meId={meId} />
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              onClick={startQuiz}
              className="bg-stone-900 text-white px-4 py-2 rounded-xl"
            >
              {totalVoters >= 2 ? "Start the quiz →" : "Start anyway →"}
            </button>
            {totalVoters < 2 && (
              <p className="text-xs text-stone-600 self-center">
                Tip: invite at least one friend before starting.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "quiz" && <Quiz onComplete={submit} />}

      {phase === "waiting" && (
        <div className="bg-white border rounded-2xl p-6 space-y-4">
          <div>
            <h2>Waiting on the rest of the crew</h2>
            <p className="text-stone-600 text-sm mt-1">
              {votedCount} of {totalVoters} voted
            </p>
            <div className="mt-3 h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-stone-900 transition-all"
                style={{
                  width: `${totalVoters > 0 ? (votedCount / totalVoters) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
          <ParticipantList room={room} meId={meId} />
          <div className="pt-2">
            {(isHost || everyoneVoted) && (
              <button
                onClick={reveal}
                disabled={votedCount === 0}
                className={`bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50 ${
                  everyoneVoted ? "animate-pulse" : ""
                }`}
              >
                {everyoneVoted ? "Reveal results ✨" : "Reveal anyway"}
              </button>
            )}
            {!isHost && !everyoneVoted && (
              <p className="text-xs text-stone-600">
                Once everyone votes, anyone can reveal the picks.
              </p>
            )}
          </div>
        </div>
      )}

      {phase === "results" && <Results room={room} onRetry={reveal} code={code} />}
    </div>
  );
}

function RoomHeader({ code, room }) {
  const url = useMemo(() => `${window.location.origin}/r/${code}`, [code]);
  const [copied, setCopied] = useState(false);
  const canNativeShare =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  const share = async () => {
    const shareData = {
      title: "ATL Decider",
      text: `Join my room on ATL Decider — code ${code}`,
      url,
    };
    try {
      if (canNativeShare) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      // user cancelled share — no-op
    }
  };

  return (
    <div className="bg-white border rounded-2xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs opacity-60">Room code</p>
        <p className="font-mono text-2xl tracking-widest">{code}</p>
      </div>
      <div className="text-right">
        <button onClick={share} className="text-sm border rounded-xl px-3 py-2">
          {copied ? "Copied!" : canNativeShare ? "Share invite" : "Copy invite link"}
        </button>
        {room?.participants?.length > 0 && (
          <p className="text-xs text-stone-600 mt-1">
            {room.participants.length} in room
          </p>
        )}
      </div>
    </div>
  );
}

function SkeletonRoom({ code }) {
  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-2xl p-4 flex items-center justify-between">
        <div>
          <p className="text-xs opacity-60">Room code</p>
          <p className="font-mono text-2xl tracking-widest">{code}</p>
        </div>
        <div className="h-9 w-32 bg-stone-100 rounded-xl animate-pulse" />
      </div>
      <div className="bg-white border rounded-2xl p-6 space-y-3">
        <div className="h-6 w-2/3 bg-stone-100 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-stone-100 rounded animate-pulse" />
        <div className="h-10 w-full bg-stone-100 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing SkeletonRoom */
