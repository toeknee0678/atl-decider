import { readFileSync } from "node:fs";
import path from "node:path";
import { rooms, json } from "./_store.js";
import { aggregateGroup } from "../../src/lib/aggregate.js";

// Load the venue dataset once at cold start.
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

  const { code, excludeIds } = body || {};
  if (!code) return json(400, { error: "code required" });

  const room = await rooms().get(code, { type: "json" });
  if (!room) return json(404, { error: "Room not found" });

  const voted = room.participants.filter((p) => p.answers);
  if (voted.length === 0) {
    return json(400, { error: "No votes have been cast yet" });
  }

  const isRetry = Array.isArray(excludeIds) && excludeIds.length > 0;

  const { results, consensus } = aggregateGroup(voted, places, {
    excludeIds: isRetry ? excludeIds : undefined,
  });

  // Only persist results + close the room on the FIRST reveal.
  // Retries return fresh picks but leave the canonical results intact
  // so late-joiners always see the original outcome.
  if (!isRetry && room.status !== "closed") {
    room.status = "closed";
    room.results = results;
    room.consensus = consensus;
    room.revealedAt = Date.now();
    await rooms().setJSON(code, room);
  }

  return json(200, { results, consensus, room });
};

/* END OF FILE — last line above is "};" closing the default export */
