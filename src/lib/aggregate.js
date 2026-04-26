// src/lib/aggregate.js
// ATL Decider — recommendation engine
// Fixes: repeat recommendations, weak area matching, lack of diversity.
// Compatible with current questions.js keys: type, price, area, energy, group.
// Forward-compatible with future fields: distance, dealBreakers, preferredTags.

// ---------- Tunable weights ----------
const WEIGHTS = {
  type: 6,         // eat vs do — must match user intent
  energy: 4,       // chill / lively / bignight / active
  groups: 3,       // date / friends / family / tourists
  price: 3,        // budget alignment
  area: 4,         // neighborhood / region preference
  distance: 2,     // willingness to travel
  tags: 1,         // soft bonus for tag overlap
};

// Tier width for shuffling: venues whose scores fall within this range
// of each other are considered "tied" and randomized within the tier.
const TIER_WIDTH = 1.5;

// How many results to return as the recommendation set
const TOP_N = 5;

// ---------- Helpers ----------

function safeArr(v) {
  return Array.isArray(v) ? v : [];
}

function shuffleInPlace(arr, rng = Math.random) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Read a "recently shown" set from sessionStorage so re-running the quiz
// surfaces fresh results within the same session.
function getRecentlyShown() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem("atl-decider:recentIds");
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function pushRecentlyShown(ids) {
  if (typeof window === "undefined") return;
  try {
    const existing = Array.from(getRecentlyShown());
    const merged = Array.from(new Set([...ids, ...existing])).slice(0, 30);
    window.sessionStorage.setItem(
      "atl-decider:recentIds",
      JSON.stringify(merged)
    );
  } catch {
    // ignore storage errors
  }
}

// ---------- Per-dimension scorers ----------

function scoreType(answers, place) {
  const want = answers.type; // "eat" | "do" | "both" | "either"
  const types = safeArr(place.type);
  if (!want || want === "either" || want === "both") {
    return types.length ? WEIGHTS.type * 0.6 : 0;
  }
  return types.includes(want) ? WEIGHTS.type : -WEIGHTS.type;
}

function scoreEnergy(answers, place) {
  const want = answers.energy; // single choice
  if (!want) return 0;
  const energies = safeArr(place.energy);
  if (!energies.length) return 0;
  return energies.includes(want) ? WEIGHTS.energy : 0;
}

function scoreGroups(answers, place) {
  const want = answers.group; // single choice (date/friends/family/tourists)
  if (!want) return 0;
  const groups = safeArr(place.groups);
  return groups.includes(want) ? WEIGHTS.groups : 0;
}

function scorePrice(answers, place) {
  // answers.price: 1-4 OR "any"
  const want = answers.price;
  const p = place.price;
  if (!want || want === "any" || typeof p !== "number") return 0;
  const target = Number(want);
  const diff = Math.abs(p - target);
  if (diff === 0) return WEIGHTS.price;
  if (diff === 1) return WEIGHTS.price * 0.4;
  return -WEIGHTS.price * 0.3;
}

function scoreArea(answers, place) {
  // Soft scoring instead of hard filter. Reads questions.js "area" key.
  const startArea = answers.area;
  const placeArea = place.area;
  if (!startArea || startArea === "any" || !placeArea) return 0;
  if (placeArea === "any") return WEIGHTS.area * 0.4;
  if (placeArea === startArea) return WEIGHTS.area;
  // Adjacent areas get partial credit
  const adjacency = {
    midtown: ["buckhead", "westside-beltline", "decatur-east"],
    buckhead: ["midtown", "otp-north"],
    "westside-beltline": ["midtown"],
    "decatur-east": ["midtown"],
    "otp-north": ["buckhead"],
  };
  const neighbors = adjacency[startArea] || [];
  if (neighbors.includes(placeArea)) return WEIGHTS.area * 0.4;
  return -WEIGHTS.area * 0.3;
}

function scoreDistance(answers, place) {
  // distance: "walking" | "across-town" | "anywhere" (optional, future)
  const d = answers.distance;
  if (!d || d === "anywhere") return 0;
  const placeArea = place.area;
  if (!placeArea) return 0;
  if (d === "walking") {
    // Heavy penalty for OTP if user wants walking distance
    if (placeArea === "otp-north") return -WEIGHTS.distance * 2;
    return WEIGHTS.distance * 0.5;
  }
  if (d === "across-town") {
    if (placeArea === "otp-north") return -WEIGHTS.distance * 0.5;
    return WEIGHTS.distance * 0.5;
  }
  return 0;
}

function scoreTags(answers, place) {
  // Free-form tag overlap bonus (used by deal-breakers and future features)
  const wanted = safeArr(answers.preferredTags);
  if (!wanted.length) return 0;
  const placeTags = safeArr(place.tags);
  const hits = wanted.filter((t) => placeTags.includes(t)).length;
  return hits * WEIGHTS.tags;
}

// ---------- Deal-breakers (hard filters) ----------

function passesDealBreakers(answers, place) {
  const dbs = safeArr(answers.dealBreakers);
  if (!dbs.length) return true;
  const tags = safeArr(place.tags);
  const groups = safeArr(place.groups);

  for (const db of dbs) {
    switch (db) {
      case "outdoor":
        if (!tags.some((t) => /patio|outdoor|rooftop|beltline/i.test(t))) {
          return false;
        }
        break;
      case "vegetarian":
        if (
          !tags.some((t) => /vegetarian|vegan|plant/i.test(t)) &&
          !["indian", "mexican", "thai", "vietnamese"].some((c) =>
            tags.includes(c)
          )
        ) {
          return false;
        }
        break;
      case "reservations":
        // Will be re-evaluated once `reservation` field is populated.
        // For now, fail venues explicitly tagged as walk-in/casual-only.
        if (tags.some((t) => /walk-?in|cash-only|dive/i.test(t))) {
          return false;
        }
        break;
      case "kid-friendly":
        if (!groups.includes("family")) return false;
        break;
      default:
        break;
    }
  }
  return true;
}

// ---------- Main scoring ----------

function scorePlace(answers, place) {
  return (
    scoreType(answers, place) +
    scoreEnergy(answers, place) +
    scoreGroups(answers, place) +
    scorePrice(answers, place) +
    scoreArea(answers, place) +
    scoreDistance(answers, place) +
    scoreTags(answers, place)
  );
}

// ---------- Diversity & recency ----------

function applyRecencyDampening(scored, recentIds) {
  if (!recentIds.size) return scored;
  return scored.map((entry) => {
    if (recentIds.has(entry.place.id)) {
      return { ...entry, score: entry.score - 1.2 };
    }
    return entry;
  });
}

function tierShuffle(scored) {
  // Group into score tiers, shuffle within each tier, then flatten.
  const sorted = [...scored].sort((a, b) => b.score - a.score);
  const tiers = [];
  let current = [];
  let tierTop = null;
  for (const entry of sorted) {
    if (tierTop === null || tierTop - entry.score <= TIER_WIDTH) {
      if (tierTop === null) tierTop = entry.score;
      current.push(entry);
    } else {
      tiers.push(current);
      current = [entry];
      tierTop = entry.score;
    }
  }
  if (current.length) tiers.push(current);
  for (const tier of tiers) shuffleInPlace(tier);
  return tiers.flat();
}

function diversifyTopResults(ordered, n = TOP_N) {
  // Penalize results whose tags heavily overlap with already-picked items.
  const picked = [];
  const remaining = [...ordered];
  while (picked.length < n && remaining.length) {
    if (!picked.length) {
      picked.push(remaining.shift());
      continue;
    }
    let bestIdx = 0;
    let bestAdjScore = -Infinity;
    for (let i = 0; i < Math.min(remaining.length, 12); i++) {
      const candidate = remaining[i];
      const cTags = new Set(safeArr(candidate.place.tags));
      let overlap = 0;
      for (const p of picked) {
        for (const t of safeArr(p.place.tags)) {
          if (cTags.has(t)) overlap += 1;
        }
      }
      const adj = candidate.score - overlap * 0.3;
      if (adj > bestAdjScore) {
        bestAdjScore = adj;
        bestIdx = i;
      }
    }
    picked.push(remaining.splice(bestIdx, 1)[0]);
  }
  return [...picked, ...remaining];
}

// ---------- Public API ----------

export function recommend(answers, places, options = {}) {
  const { topN = TOP_N, persistRecency = true } = options;

  const filtered = places.filter((p) => passesDealBreakers(answers, p));

  let scored = filtered.map((place) => ({
    place,
    score: scorePlace(answers, place),
  }));

  // Drop very poor matches before tier shuffling
  scored = scored.filter((e) => e.score > -WEIGHTS.type);

  const recent = getRecentlyShown();
  scored = applyRecencyDampening(scored, recent);

  const tiered = tierShuffle(scored);
  const diversified = diversifyTopResults(tiered, topN);

  const top = diversified.slice(0, topN);

  if (persistRecency && top.length) {
    pushRecentlyShown(top.map((e) => e.place.id));
  }

  return top.map((e) => ({ ...e.place, _score: Number(e.score.toFixed(2)) }));
}

// Default export for convenience
export default recommend;
