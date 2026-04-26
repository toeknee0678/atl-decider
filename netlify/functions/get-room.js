import { rooms, json } from "./_store.js";

export default async (req) => {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  if (!code) {
    return json(400, { error: "code required" });
  }

  const room = await rooms().get(code, { type: "json" });
  if (!room) {
    return json(404, { error: "Room not found" });
  }

  return json(200, { room });
};
