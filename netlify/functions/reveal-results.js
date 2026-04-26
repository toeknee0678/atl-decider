import { readFileSync } from "node:fs";
import path from "node:path";
import { rooms, json } from "./_store.js";
import { aggregateGroup } from "../../src/lib/aggregate.js";

// Load the venue dataset from public/places.json at cold start.
// Cached for the lifetime of the function instance for fast reveals.
const placesPath = path.join(process.cwd(), "public", "places.json");
const places = JSON.parse(readFileSync(placesPath, "utf8"));

export default async (req) => {
  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const { code } = body || {};
  if (!code) return json(400, { error: "code required" });

  const room = await rooms().get(code, { type: "json" });
  if (!room) return json(404, { error: "Room not found" });

  // Only count participants who actually submitted answers.
  const voted = room.participants.filter((p) => p.answers);
  if (voted.length === 0) {
    return json(400, { error: "No votes have been cast yet" });
  }

  const { results, consensus } = aggregateGroup(voted, places);

  // Persist results so late-joiners (or refreshes) see the same outcome.
  room.status = "closed";
  room.results = results;
  room.consensus = consensus;
  room.revealedAt = Date.now();

  await rooms().setJSON(code, room);

  return json(200, { results, consensus, room });
};
