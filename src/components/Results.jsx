export default function Results({ room }) {
  return (
    <div className="space-y-4">
      <ConsensusBanner consensus={room.consensus} />
      {room.results.map((r, i) => (
        <PlaceCard key={r.venue.id} rank={i + 1} {...r} />
      ))}
      {room.results.length === 0 && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
          No venue satisfies everyone's must-haves. Loosen the filters and try again.
        </div>
      )}
    </div>
  );
}

function ConsensusBanner({ consensus }) {
  if (!consensus) return null;
  const price = Number(consensus.price?.winner) || 2;
  return (
    <div className="bg-stone-900 text-white rounded-2xl p-4 text-sm">
      <p className="opacity-70 mb-1">Group consensus</p>
      <p>
        {labelType(consensus.type?.winner)} · {"$".repeat(price)} ·{" "}
        {labelArea(consensus.area?.winner)} ·{" "}
        {labelEnergy(consensus.energy?.winner)} ·{" "}
        {labelGroup(consensus.group?.winner)}
      </p>
    </div>
  );
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

function PlaceCard({ rank, venue, groupScore, breakdown }) {
  return (
    <div className="bg-white border rounded-2xl p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">
          #{rank} · {venue.name}
        </h3>
        <span className="text-xs opacity-60">
          score {groupScore.toFixed(1)}
        </span>
      </div>
      <p className="text-sm opacity-70">
        {venue.neighborhood} · {"$".repeat(venue.price)}
      </p>
      <p className="my-2">{venue.blurb}</p>

      {venue.sources?.length > 0 && (
        <div className="flex flex-wrap gap-2 my-2">
          {venue.sources.map((s) => (
            <a
              key={s.url || s.pub}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs border rounded-full px-2 py-1 hover:bg-stone-900 hover:text-white"
            >
              Featured in {s.pub}
            </a>
          ))}
        </div>
      )}

      <details className="mt-2">
        <summary className="text-xs opacity-60 cursor-pointer">
          Why we picked this
        </summary>
        <ul className="text-x
