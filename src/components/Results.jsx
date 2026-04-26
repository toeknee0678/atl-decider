import { useMemo, useState } from "react";
import { recommendSolo } from "../lib/recommend";
import places from "../../public/places.json";
import { enrich } from "../data/enrichments";
import ResultsMap from "./ResultsMap";

export default function Results({ recommendations, answers, onRetry }) {
  const [excluded, setExcluded] = useState([]);
  const [picks, setPicks] = useState(recommendations);
  const [highlightedId, setHighlightedId] = useState(null);

  const visible = picks.filter((v) => !excluded.includes(v.id));
  const enrichedVisible = useMemo(
    () => visible.map((v) => enrich(v)),
    [visible]
  );
  const winner = enrichedVisible[0];
  const runnersUp = enrichedVisible.slice(1, 4);
  const mapVenues = enrichedVisible.slice(0, 5); // top 5 pinned

  const showDifferent = () => {
    const idsToExclude = visible.map((v) => v.id);
    const fresh = recommendSolo(answers, places, 5).filter(
      (v) => !idsToExclude.includes(v.id)
    );
    if (fresh.length > 0) {
      setPicks(fresh);
      setExcluded([]);
      setHighlightedId(null);
    } else {
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
      <WinnerCard
        venue={winner}
        onHover={() => setHighlightedId(winner.id)}
        onLeave={() => setHighlightedId(null)}
      />

      {runnersUp.length > 0 && (
        <div>
          <p className="text-xs uppercase tracking-widest opacity-60 mb-2 px-1">
            Other strong options
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {runnersUp.map((v, i) => (
              <RunnerUpCard
                key={v.id}
                venue={v}
                rank={i + 2}
                onHover={() => setHighlightedId(v.id)}
                onLeave={() => setHighlightedId(null)}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-xs uppercase tracking-widest opacity-60 mb-2 px-1">
          On the map
        </p>
        <ResultsMap
          venues={mapVenues}
          highlightedId={highlightedId}
          onPinClick={(id) => setHighlightedId(id)}
        />
      </div>

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

function WinnerCard({ venue, onHover, onLeave }) {
  const reason = buildReason(venue);
  return (
    <div
      className="bg-white border rounded-2xl p-6"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
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
        <p
          className="text-sm font-medium mb-3"
          style={{ color: "var(--accent-ink, #8a3315)" }}
        >
          {reason}
        </p>
      )}
      <SourceChips sources={venue.sources} />
      <ActionRow venue={venue} primary />
    </div>
  );
}

function RunnerUpCard({ venue, rank, onHover, onLeave }) {
  return (
    <div
      className="bg-white border rounded-2xl p-4"
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
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
      <ActionRow venue={venue} />
    </div>
  );
}

function ActionRow({ venue, primary = false }) {
  const r = venue.reservation;
  const directionsUrl = buildDirectionsUrl(venue);

  const labels = {
    resy: "Reserve on Resy",
    opentable: "Reserve on OpenTable",
    tock: "Reserve on Tock",
    tickets: "Get tickets",
    yelp: "Check on Yelp",
  };

  const colors = {
    resy: "#e60023",
    opentable: "#da3743",
    tock: "#1f2937",
    tickets: "#0f766e",
    yelp: "#af0606",
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-2 ${
        primary ? "mt-4" : "mt-3"
      }`}
    >
      {r && r.url ? (
        <a
          href={r.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 font-medium text-white ${
            primary ? "text-sm" : "text-xs px-2.5 py-1.5"
          }`}
          style={{ background: colors[r.platform] || "#1c1917" }}
        >
          {labels[r.platform] || "Book / Tickets"}
        </a>
      ) : (
        <span
          className={`inline-flex items-center rounded-xl border px-3 py-1.5 ${
            primary ? "text-sm" : "text-xs"
          } opacity-70`}
        >
          Walk-ins only
        </span>
      )}
      {directionsUrl && (
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center rounded-xl border px-3 py-1.5 hover:bg-stone-900 hover:text-white transition ${
            primary ? "text-sm" : "text-xs"
          }`}
        >
          Directions
        </a>
      )}
      {venue.url && (
        <a
          href={venue.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline opacity-70 hover:opacity-100 ${
            primary ? "text-sm" : "text-xs"
          }`}
        >
          Visit site →
        </a>
      )}
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

function buildDirectionsUrl(venue) {
  if (venue.coords && venue.coords.length === 2) {
    const [lat, lng] = venue.coords;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }
  if (venue.name) {
    const q = encodeURIComponent(`${venue.name} ${venue.neighborhood || "Atlanta"}`);
    return `https://www.google.com/maps/search/?api=1&query=${q}`;
  }
  return null;
}

/* END OF FILE — last line above is "}" closing buildDirectionsUrl */
