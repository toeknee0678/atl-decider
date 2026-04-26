import { rooms, makeRoomCode, json } from "./_store.js";

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

  const hostName = body?.hostName;
  if (!hostName?.trim()) {
    return json(400, { error: "hostName required" });
  }

  // Generate a unique code (retry up to 5 times if a collision occurs)
  let code;
  for (let i = 0; i < 5; i++) {
    const candidate = makeRoomCode();
    const existing = await rooms().get(candidate, { type: "json" });
    if (!existing) {
      code = candidate;
      break;
    }
  }
  if (!code) {
    return json(500, { error: "Could not generate unique room code" });
  }

  const room = {
    code,
    status: "open",
    createdAt: Date.now(),
    hostName: hostName.trim().slice(0, 40),
    participants: [],
  };

  await rooms().setJSON(code, room);
  return json(200, { code, room });
};
