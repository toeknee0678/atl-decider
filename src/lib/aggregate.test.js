import { describe, it, expect } from "vitest";
import { aggregateGroup } from "./aggregate.js";

const places = [
  {
    id: "a",
    name: "A",
    type: ["eat"],
    price: 2,
    area: "midtown",
    energy: ["lively"],
    groups: ["friends"],
    tags: [],
    sources: [{ pub: "Eater" }],
  },
  {
    id: "b",
    name: "B",
    type: ["eat"],
    price: 3,
    area: "midtown",
    energy: ["chill"],
    groups: ["date"],
    tags: [],
    sources: [],
  },
];

describe("aggregateGroup", () => {
  it("favors venues matching the most users", () => {
    const participants = [
      {
        id: "1",
        name: "X",
        weight: 1,
        answers: { type: "eat", price: 2, area: "midtown", energy: "lively", group: "friends" },
      },
      {
        id: "2",
        name: "Y",
        weight: 1,
        answers: { type: "eat", price: 2, area: "midtown", energy: "lively", group: "friends" },
      },
    ];
    const { results } = aggregateGroup(participants, places);
    expect(results[0].venue.id).toBe("a");
  });

  it("respects hard filters across all users", () => {
    const participants = [
      {
        id: "1",
