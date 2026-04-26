// src/data/questions.js
// Question definitions for ATL Decider quiz.
// `multi: true` indicates a multi-select question (handled in Quiz.jsx).
// `optional: true` indicates the user can skip the question entirely.

export const questions = [
  {
    key: "type",
    label: "What are we trying to do?",
    options: [
      { value: "eat", label: "Eat 🍽️" },
      { value: "do", label: "Do something 🎟️" },
      { value: "both", label: "Both" },
    ],
  },
  {
    key: "price",
    label: "Budget per person?",
    options: [
      { value: 1, label: "$ — under $15" },
      { value: 2, label: "$$ — $15–35" },
      { value: 3, label: "$$$ — $35–70" },
      { value: 4, label: "$$$$ — $70+" },
    ],
  },
  {
    key: "area",
    label: "Where are you starting from?",
    options: [
      { value: "midtown", label: "Midtown" },
      { value: "buckhead", label: "Buckhead" },
      { value: "westside-beltline", label: "Westside / BeltLine" },
      { value: "decatur-east", label: "Decatur / East ATL" },
      { value: "otp-north", label: "OTP North (Sandy Springs / Alpharetta)" },
      { value: "any", label: "No preference" },
    ],
  },
  {
    key: "distance",
    label: "How far are you willing to go?",
    options: [
      { value: "walking", label: "Walking or short drive (<10 min)" },
      { value: "across-town", label: "Across town is fine (10–25 min)" },
      { value: "anywhere", label: "Anywhere in Metro ATL (25+ min OK)" },
    ],
  },
  {
    key: "energy",
    label: "What's the vibe?",
    options: [
      { value: "chill", label: "Chill & low-key" },
      { value: "lively", label: "Lively & social" },
      { value: "bignight", label: "Big night out" },
      { value: "active", label: "Active / outdoorsy" },
    ],
  },
  {
    key: "group",
    label: "Who's coming?",
    options: [
      { value: "date", label: "Date night" },
      { value: "friends", label: "Friends hangout" },
      { value: "family", label: "Family with kids" },
      { value: "tourists", label: "Showing off ATL to out-of-towners" },
    ],
  },
  {
    key: "dealBreakers",
    label: "Anything that's a must? (optional — pick any)",
    multi: true,
    optional: true,
    options: [
      { value: "outdoor", label: "Outdoor seating" },
      { value: "vegetarian", label: "Vegetarian / vegan-friendly" },
      { value: "reservations", label: "Reservations a must" },
      { value: "kid-friendly", label: "Kid-friendly" },
    ],
  },
];

/* END OF FILE — last line above is "];" closing the questions array */
