import { rooms, json } from "./_store.js";

const VALID_KEYS = ["type", "price", "area", "energy", "group", "mustHave"];

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

  const { code, participantId, answers } = body || {};

  if (!code) return json(400, { error: "code required" });
  if (!participantId) return json(400, { error: "participantId required" });
  if (!answers || typeof answers !== "object") {
    return json(400, { error: "answers object required" });
  }

  const room = await rooms().get(code, { type: "json" });
  if (!room) return json(404, { error: "Room not found" });
  if (room.status !== "open") return json(400, { error: "Voting is closed" });

  const p = room.participants.find((x) => x.id === participantId);
  if (!p) return json(404, { error: "Participant not found in this room" });

  // Sanitize: only keep recognized answer keys.
  const cleanAnswers = {};
  for (const k of VALID_KEYS) {
    if (answers[k] !== undefined) cleanAnswers[k] = answers[k];
  }

  p.answers = cleanAnswers;
  p.submittedAt = Date.now();

  await rooms().setJSON(code, room);
  return json(200, { ok: true, room });
};
