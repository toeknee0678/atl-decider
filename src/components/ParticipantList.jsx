export default function ParticipantList({ room, meId }) {
  return (
    <ul className="space-y-2">
      {room.participants.map((p) => (
        <li
          key={p.id}
          className="flex items-center justify-between border rounded-xl p-2"
        >
          <span>
            {p.name}{" "}
            {p.id === meId && <span className="opacity-50">(you)</span>}
          </span>
          <span
            className={`text-sm ${p.answers ? "text-green-700" : "opacity-50"}`}
          >
            {p.answers ? "✓ voted" : "thinking…"}
          </span>
        </li>
      ))}
    </ul>
  );
}
