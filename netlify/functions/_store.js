import { getStore } from "@netlify/blobs";

// Returns a handle to the "rooms" KV store.
// Netlify Blobs is built into Netlify - no setup, no external DB required.
export const rooms = () => getStore("rooms");

// Generate a 6-character room code using an alphabet that excludes
// visually ambiguous characters (no 0/O, 1/I/L, etc.) so codes are
// easy to read aloud and type from a text message.
export function makeRoomCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

// Helper that builds a JSON Response object - used by every function.
export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
