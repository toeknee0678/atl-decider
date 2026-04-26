import { useEffect, useRef, useState } from "react";
import { questions } from "../data/questions";

export default function Quiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chosen, setChosen] = useState(null); // visual flash on the picked option
  const [transitioning, setTransitioning] = useState(false);
  const containerRef = useRef(null);
  const q = questions[step];

  // Smooth scroll to top of quiz card on each new question
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [step]);

  const haptic = () => {
    try {
      if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
        navigator.vibrate(10);
      }
    } catch {}
  };

  const choose = (value) => {
    if (transitioning) return; // prevent double-taps during transition
    haptic();
    setChosen(value);
    const next = { ...answers, [q.key]: value };

    setTransitioning(true);
    // Brief delay so the user sees their tap acknowledged before we swap
    setTimeout(() => {
      setAnswers(next);
      setChosen(null);
      setTransitioning(false);
      if (step + 1 === questions.length) {
        onComplete(next);
      } else {
        setStep(step + 1);
      }
    }, 220);
  };

  const goBack = () => {
    if (step > 0 && !transitioning) {
      haptic();
      setStep(step - 1);
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div ref={containerRef} className="bg-white border rounded-2xl p-6">
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest opacity-60">
            Question {step + 1} of {questions.length}
          </p>
          <p className="text-xs opacity-60">{Math.round(progress)}%</p>
        </div>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-900 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="mb-5">{q.label}</h2>

      <div
        className="grid gap-2 transition-opacity duration-200"
        style={{ opacity: transitioning ? 0.4 : 1 }}
      >
        {q.options.map((o) => {
          const isChosen = chosen === o.value;
          return (
            <button
              key={String(o.value)}
              onClick={() => choose(o.value)}
              disabled={transitioning}
              className="text-left border rounded-xl p-3 hover:bg-stone-900 hover:text-white transition"
              style={
                isChosen
                  ? {
                      transform: "scale(0.98)",
                      borderColor: "var(--accent, #d2532a)",
                      background: "var(--accent-soft, #fbe8de)",
                      color: "var(--accent-ink, #8a3315)",
                    }
                  : undefined
              }
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {step > 0 && (
        <button
          onClick={goBack}
          className="mt-4 text-sm opacity-60 hover:opacity-100"
        >
          ← Back
        </button>
      )}
    </div>
  );
}

/* END OF FILE — last line above is "}" closing the Quiz component */
