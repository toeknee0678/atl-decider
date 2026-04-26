import { useState } from "react";

export default function Results({ room, code }) {
  const [excludedIds, setExcludedIds] = useState([]);
  const [retrying, setRetrying] = useState(false);
  const [retryResults, setRetryResults] = useState(null);
  const [spinPick, setSpinPick] = useState(null);
  const [spinning, setSpinning] = useState(false);

  // Use retry results if we've requested a re-rank, else original
  const sourceResults = retryResults ?? room.results ?? [];
  const visible = sourceResults.filter((r) => !excludedIds.includes(r.venue.id));

  const winner = visible[0];
  const runnersUp = visible.slice(1, 4);

  const tryAgain = async () => {
    if (visible.length === 0) return;
    setRetrying(true);
    try {
      const res = await fetch("/.netlify/functions/reveal-results", {
        method: "POST",
        body: JSON.stringify({
          code,
          excludeIds: visible.map((r) => r.venue.id),
        }),
      }).then((r) => r.json());
      if (res.results && res.results.length > 0) {
        setRetryResults(res.results);
        setExcludedIds([]); // reset local exclusions since backend already filtered
      } else {
        // No more options — keep current view
        setRetryResults([]);
      }
    } catch {
      // ignore — keep current view
    } finally {
      setRetrying(false);
    }
  };

  const spin = () => {
    if (visible.length < 2 || spinning) return;
    setSpinning(true);
    setSpinPick(null);
    const candidates = visible.slice(0, Math.min(visible.length, 3));
    let i = 0;
    const interval = setInterval(() => {
      setSpinPick(candidates[i % candidates.length]);
      i++;
    }, 90);
    setTimeout(() => {
      clearInterval(interval);
      // Final pick — biased toward the higher-ranked option
      const weights = candidates.map((_, idx) => candidates.length - idx);
      const total = weights.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      let chosen = candidates[0];
      for (let k = 0; k < candidates.length; k++) {
        r -= weights[k];
        if (r <= 0) {
          chosen = candidates[k];
          break;
        }
      }
      setSpinPick(chosen);
      setSpinning(false);
    }, 1800);
  };

  if (!winner) {
    return (
      <div className="space-y-4">
        <ConsensusBanner consensus={room.consensus} />
        <EmptyState consensus={room.consensus} />
        {retryResults !== null && (
          <p className="text-sm text-stone-600 text-center">
            No more matches found. Try different answers next time.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ConsensusBanner consensus={room.consensus} />

      <WinnerCard result={winner} spinPick={spinPick} spinning={spinning} />

      {runnersUp.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2 px-1">
            Other strong options
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {runnersUp.map((r, i) => (
              <RunnerUpCard key={r.venue.id} result={r} rank={i + 2} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Still can't decide?</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={spin}
            disabled={spinning || visible.length < 2}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            {spinning ? "Spinning…" : "🎰 Spin to pick one"}
          </button>
          <button
            onClick={tryAgain}
            disabled={retrying}
            className="bg-white border px-4 py-2 rounded-xl"
          >
            {retrying ? "Loading…" : "Show different options"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------- Sub-components ----------------- */

function ConsensusBanner({ consensus }) {
  if (!consensus) return null;
  const price = Number(consensus.price?.winner) || 2;
  return (
    <div className="bg-stone-900 text-white rounded-2xl p-5">
      <p className="text-xs uppercase tracking-widest opacity-70 mb-1">
        Group consensus
      </p>
      <p className="text-base">
        {labelType(consensus.type?.winner)} · {"$".repeat(price)} ·{" "}
        {labelArea(consensus.area?.winner)} ·{" "}
        {labelEnergy(consensus.energy?.winner)} ·{" "}
        {labelGroup(consensus.group?.winner)}
      </p>
    </div>
  );
}

function WinnerCard({ result, spinPick, spinning }) {
  // If a spin is in progress or finished, the winner card highlights that pick instead
  const display = spinPick || result;
  const { venue, groupScore, breakdown } = display;
  const reason = buildReason(display);

  return (
    <div
      className={`bg-white border rounded-2xl p-6 relative overflow-hidden ${
        spinning ? "ring-2 ring-offset-2 ring-stone-900 animate-pulse" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase tracking-widest font-bold opacity-70">
          {spinPick ? "🎰 The wheel says" : "✨ The pick"}
        </span>
        <span className="text-xs opacity-60">score {groupScore.toFixed(1)}</span>
      </div>
      <h2 className="text-3xl mb-1">{venue.name}</h2>
      <p className="text-sm opacity-70 mb-3">
        {venue.neighborhood} · {"$".repeat(venue.price)}
      </p>
      <p className="mb-3">{venue.blurb}</p>
      {reason && (
        <p className="text-sm font-medium mb-3" style={{ color: "var(--accent-ink, #8a3315)" }}>
          {reason}
        </p>
      )}
      <SourceChips sources={venue.sources} />
      <Breakdown breakdown={breakdown} />
      <a
        href={venue.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-4 text-sm underline"
      >
        Visit site →
      </a>
    </div>
  );
}

function RunnerUpCard({ result, rank }) {
  const { venue, groupScore, breakdown } = result;
  const reason = buildReason(result);
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold text-base">
          #{rank} · {venue.name}
        </h3>
        <span className="text-xs opacity-60">{groupScore.toFixed(1)}</span>
      </div>
      <p className="text-xs opacity-70 mb-2">
        {venue.neighborhood} · {"$".repeat(venue.price)}
      </p>
      <p className="text-sm mb-2">{venue.blurb}</p>
      {reason && (
        <p className="text-xs mb-2" style={{ color: "var(--accent-ink, #8a3315)" }}>
          {reason}
        </p>
      )}
      <SourceChips sources={venue.sources} small />
      <Breakdown breakdown={breakdown} />
      <a
        href={venue.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block mt-2 text-xs underline"
      >
        Visit site →
      </a>
    </div>
  );
}

function SourceChips({ sources, small = false }) {
  if (!sources?.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mb-1">
      {sources.map((s) => (
        <a
          key={s.url || s.pub}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-xs border rounded-full px-2 py-1 hover:bg-stone-900 hover:text-white ${
            small ? "text-[10px] py-0.5 px-2" : ""
          }`}
        >
          Featured in {s.pub}
        </a>
      ))}
    </div>
  );
}

function Breakdown({ breakdown }) {
  if (!breakdown?.length) return null;
  return (
    <details className="mt-2">
      <summary className="text-xs opacity-60 cursor-pointer">
        Why we picked this
      </summary>
      <ul className="text-xs mt-2 space-y-1">
        {breakdown.map((b) => (
          <li key={b.userName}>
            {b.userName} ranked it #{b.rank} ({b.points} pts)
          </li>
        ))}
      </ul>
    </details>
  );
}

function EmptyState({ consensus }) {
  // Suggest the most likely culprit — usually the strictest filter is area or price
  const suggestions = [];
  if (consensus?.area?.winner && consensus.area.winner !== "any") {
    suggestions.push(`broaden the area beyond ${labelArea(consensus.area.winner)}`);
  }
  if (consensus?.price?.winner) {
    suggestions.push(`flex the price range`);
  }
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
      <p className="font-semibold mb-1">No spot fits everyone perfectly.</p>
      <p className="text-sm">
        {suggestions.length > 0
          ? `Try again — maybe ${suggestions.join(" or ")}.`
          : "Try again with slightly different answers."}
      </p>
    </div>
  );
}

/* ----------------- Helpers ----------------- */

function buildReason(result) {
  const { venue, breakdown } = result;
  const parts = [];

  const sourceCount = venue.sources?.length || 0;
  if (sourceCount >= 2) {
    parts.push(`Featured in ${sourceCount} publications`);
  } else if (sourceCount === 1) {
    parts.push(`Featured in ${venue.sources[0].pub}`);
  }

  if (breakdown?.length) {
    const topRank = Math.min(...breakdown.map((b) => b.rank));
    if (topRank === 1) {
      const topVoter = breakdown.find((b) => b.rank === 1);
      parts.push(`${topVoter.userName}'s top pick`);
    }
  }

  return parts.join(" · ");
}

function labelType(t) {
  return t === "eat" ? "Eating" : t === "do" ? "Doing" : t === "both" ? "Eat + Do" : "—";
}

function labelArea(a) {
  const map = {
    "midtown": "Midtown",
    "buckhead": "Buckhead",
    "westside-beltline": "Westside / BeltLine",
    "decatur-east": "Decatur / East ATL",
    "otp-north": "OTP North",
    "any": "Anywhere",
  };
  return map[a] || a || "—";
}

function labelEnergy(e) {
  const map = {
    "chill": "Chill",
    "lively": "Lively",
    "bignight": "Big night",
    "active": "Active",
  };
  return map[e] || e || "—";
}

function labelGroup(g) {
  const map = {
    "date": "Date night",
    "friends": "Friends",
    "family": "Family",
    "tourists": "Tourists",
  };
  return map[g] || g || "—";
}

/* END OF FILE — last line above is "}" closing labelGroup */
