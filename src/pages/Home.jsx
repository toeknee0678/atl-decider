import { useState } from "react";
import Quiz from "../components/Quiz";
import Results from "../components/Results";
import { recommendSolo } from "../lib/recommend";
import places from "../../public/places.json";

export default function Home() {
  // Phases: "hero" -> "quiz" -> "results"
  const [phase, setPhase] = useState("hero");
  const [answers, setAnswers] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const startQuiz = () => setPhase("quiz");

  const handleQuizComplete = (finalAnswers) => {
    setAnswers(finalAnswers);
    const picks = recommendSolo(finalAnswers, places, 5);
    setRecommendations(picks);
    setPhase("results");
    // Smooth scroll to top so users see the winner first
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  const reset = () => {
    setAnswers(null);
    setRecommendations([]);
    setPhase("hero");
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
  };

  if (phase === "hero") {
    return <Hero onStart={startQuiz} />;
  }

  if (phase === "quiz") {
    return <Quiz onComplete={handleQuizComplete} />;
  }

  return (
    <Results
      recommendations={recommendations}
      answers={answers}
      onRetry={reset}
    />
  );
}

function Hero({ onStart }) {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border p-8">
        <p className="text-xs uppercase tracking-widest opacity-60 mb-2">
          Metro Atlanta · Eat or do
        </p>
        <h2 className="text-3xl mb-3">Where should you go tonight?</h2>
        <p className="text-stone-600 mb-6 text-lg">
          Answer 5 quick questions. We'll recommend Atlanta spots that
          critics love and that fit what you're in the mood for.
        </p>
        <button
          onClick={onStart}
          className="bg-stone-900 text-white px-5 py-3 rounded-xl"
        >
          Find me a spot →
        </button>
      </section>

      <section className="grid sm:grid-cols-3 gap-3">
        <Feature title="5 questions">
          Quick taps, no typing. Done in under a minute.
        </Feature>
        <Feature title="Editorially backed">
          Picks pulled from The Infatuation, Eater Atlanta, and more.
        </Feature>
        <Feature title="Instant answer">
          One recommendation, plus a few backups in case the first is closed.
        </Feature>
      </section>
    </div>
  );
}

function Feature({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border p-5">
      <div className="font-semibold mb-1">{title}</div>
      <p className="text-sm text-stone-600">{children}</p>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing Feature */
