import { rankForUser } from "./recommend.js";

/**
 * Borda count with per-user weights and an editorial tiebreaker.
 *
 * @param {Array} participants  [{ id, name, weight, answers }]
 * @param {Array} places        full venue dataset
 * @returns {{ results: Array, consensus: object }}
 */
export function aggregateGroup(participants, places) {
  const scoreMap = new Map();
  const breakdown = new Map();
  const eligibleByUser = new Map();

  for (const user of participants) {
    const ranked = rankForUser(user.answers, places);
    eligibleByUser.set(user.id, new Set(ranked.map((r) => r.venue.id)));

    ranked.forEach((r, idx) => {
      const points = (ranked.length - idx) * (user.weight ?? 1);
      scoreMap.set(r.venue.id, (scoreMap.get(r.venue.id) || 0) + points);

      if (!breakdown.has(r.venue.id)) breakdown.set(r.venue.id, []);
      breakdown.get(r.venue.id).push({
        userName: user.name,
        rank: idx + 1,
        points: Math.round(points * 10) / 10,
      });
    });
  }

  const passesAllFilters = (venueId) =>
    [...eligibleByUser.values()].every((set) => set.has(venueId));

  const results = places
    .filter((p) => passesAllFilters(p.id))
    .map((p) => ({
      venue: p,
      groupScore: scoreMap.get(p.id) || 0,
      breakdown: breakdown.get(p.id) || [],
    }))
    .sort((a, b) => b.groupScore - a.groupScore)
    .slice(0, 5);

  const consensus = computeConsensus(participants);
  return { results, consensus };
}

function computeConsensus(participants) {
  const keys = ["type", "price", "area", "energy", "group"];
  const out = {};
  for (const key of keys) {
    const counts = {};
    for (const u of participants) {
      const v = u.answers?.[key];
      if (v === undefined) continue;
      counts[v] = (counts[v] || 0) + (u.weight ?? 1);
    }
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    out[key] = { winner: sorted[0]?.[0], distribution: counts };
  }
  return out;
}
