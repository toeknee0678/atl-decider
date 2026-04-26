import { rankForUser } from "./recommend.js";

/**
 * Borda count with per-user weights and an editorial tiebreaker.
 *
 * @param {Array} participants  [{ id, name, weight, answers }]
 * @param {Array} places        full venue dataset
 * @returns {{ results: Array, consensus: object }}
 */
export function aggregateGroup(participants, places) {
  const scoreMap = new Map();        // venueId -> total points
  const breakdown = new Map();       // venueId -> [{ userName, rank, points }]
  const eligibleByUser = new Map();  // userId -> Set of venueIds that passed their filters

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

  // A venue must satisfy EVERY user's hard
