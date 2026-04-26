// Score a single venue against one person's answers.
// Returns null to hard-exclude, or a number (higher = better fit).
export function scoreVenue(venue, answers) {
  let score = 0;

  // Hard filter: type must match (unless user picked "both")
  if (answers.type !== "both" && !venue.type.includes(answers.type)) return null;

  // Hard filter: any "must have" tags the user requires
  if (answers.mustHave?.length) {
    for (const tag of answers.mustHave) {
      if (!venue.tags?.includes(tag)) return null;
    }
  }

  // Soft scoring below

  // Price proximity: 3 pts if exact, 2 pts if off by 1, etc.
  const priceDelta = Math.abs(venue.price - answers.price);
  score += Math.max(0, 3 - priceDelta);

  // Area: 2 pts if user said "any", venue is "any", or they match
  if (answers.area === "any" || venue.area === "any" || venue.area === answers.area) {
    score += 2;
  }

  // Energy match: 2 pts
  if (venue.energy?.includes(answers.energy)) score += 2;

  // Group context match: 2 pts
  if (venue.groups?.includes(answers.group)) score += 2;

  // Editorial boost: up to 2 pts based on how many publications cover it
  const editorial = Math.min(2, (venue.sources?.length || 0) * 0.7);
  score += editorial;

  return score;
}

// Returns the full ranked list for one user (used by the group aggregator).
export function rankForUser(answers, places) {
  return places
    .map((p) => ({ venue: p, score: scoreVenue(p, answers) }))
    .filter((r) => r.score !== null)
    .sort((a, b) => b.score - a.score);
}

// Single-user top-N (used in solo mode, debugging, previews).
export function recommendSolo(answers, places, n = 3) {
  return rankForUser(answers, places)
    .slice(0, n)
    .map((r) => r.venue);
}
