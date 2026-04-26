import { rooms, json } from "./_store.js";

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

  const { code, displayName, weight = 1 } = body || {};

  if (!code) return json(400, { error: "code required" });
  if (!displayName?.trim()) return json(400, { error: "displayName required" });

  const room = await rooms().get(code, { type: "json" });
  if (!room) return json(404, { error: "Room not found" });
  if (room.status !== "open") return json(400, { error: "Room is closed" });

  // Soft cap: keep rooms small. 12 is plenty for a friend group.
  if (room.participants.length >= 12) {
    return json(400, { error: "Room is full (max 12 participants)" });
  }

  const id = crypto.randomUUID();
  room.participants.push({
    id,
    name: displayName.trim().slice(0, 30),
    weight: Math.max(0.5, Math.min(2, Number(weight) || 1)),
    answers: null,
    submittedAt: null,
    joinedAt: Date.now(),
  });

  await rooms().setJSON(code, room);
  return json(200, { participantId: id, room });
};
