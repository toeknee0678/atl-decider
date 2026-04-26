import { useState } from "react";
import { recommendSolo } from "../lib/recommend";
import places from "../../public/places.json";

export default function Results({ recommendations, answers, onRetry }) {
  const [excluded, setExcluded] = useState([]);
  const [picks, setPicks] = useState(recommendations);

  const visible = picks.filter((v) => !excluded.includes(v.id));
  const winner = visible[0];
  const runnersUp = visible.slice(1, 4);

  const showDifferent = () => {
    // Re-rank, excluding the venues currently shown
    const idsToExclude = visible.map((v) => v.id);
    const fresh = recommendSolo(answers, places, 5).filter(
      (v) => !idsToExclude.includes(v.id)
    );
    if (fresh.length > 0) {
      setPicks(fresh);
      setExcluded([]);
    } else {
      // No more matches in the dataset — show empty state
      setPicks([]);
    }
  };

  if (!winner) {
    return (
      <div className="space-y-4">
        <EmptyState answers={answers} />
        <div className="flex gap-2">
          <button
            onClick={onRetry}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl"
          >
            Try different answers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <WinnerCard venue={winner} />

      {runnersUp.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2 px-1">
            Other strong options
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {runnersUp.map((v, i) => (
              <RunnerUpCard key={v.id} venue={v} rank={i + 2} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-2xl p-5 space-y-3">
        <h3 className="font-semibold">Not feeling it?</h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={showDifferent}
            className="bg-white border px-4 py-2 rounded-xl"
          >
            Show different options
          </button>
          <button
            onClick={onRetry}
            className="bg-stone-900 text-white px-4 py-2 rounded-xl"
          >
            Start over
          </button>
        </div>
      </div>
    </div>
  );
}

function WinnerCard({ venue }) {
  const reason = buildReason(venue);
  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs uppercase tracking-widest font-bold opacity-70">
          ✨ The pick
        </span>
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

function RunnerUpCard({ venue, rank }) {
  return (
    <div className="bg-white border rounded-2xl p-4">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="font-semibold text-base">
          #{rank} · {venue.name}
        </h3>
      </div>
      <p className="text-xs opacity-70 mb-2">
        {venue.neighborhood} · {"$".repeat(venue.price)}
      </p>
      <p className="text-sm mb-2">{venue.blurb}</p>
      <SourceChips sources={venue.sources} small />
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

function EmptyState({ answers }) {
  const suggestions = [];
  if (answers?.area && answers.area !== "any") {
    suggestions.push("broaden the area to 'No preference'");
  }
  if (answers?.price) {
    suggestions.push("flex the price range");
  }
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5">
      <p className="font-semibold mb-1">No spot fits all your filters.</p>
      <p className="text-sm">
        {suggestions.length > 0
          ? `Try again — maybe ${suggestions.join(" or ")}.`
          : "Try again with slightly different answers."}
      </p>
    </div>
  );
}

function buildReason(venue) {
  const parts = [];
  const sourceCount = venue.sources?.length || 0;
  if (sourceCount >= 2) {
    parts.push(`Featured in ${sourceCount} publications`);
  } else if (sourceCount === 1) {
    parts.push(`Featured in ${venue.sources[0].pub}`);
  }
  return parts.join(" · ");
}

/* END OF FILE — last line above is "}" closing buildReason */
