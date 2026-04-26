import { useEffect, useMemo, useRef, useState } from "react";
import { questions } from "../data/questions";

export default function Quiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [chosen, setChosen] = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const [multiSelections, setMultiSelections] = useState([]);
  const containerRef = useRef(null);

  const q = questions[step];
  const isMulti = !!q?.multi;
  const isOptional = !!q?.optional;
  const isLast = step + 1 === questions.length;

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
    // Reset multi-select state when entering a multi question
    setMultiSelections([]);
  }, [step]);

  const haptic = () => {
    try {
      if (
        typeof navigator !== "undefined" &&
        typeof navigator.vibrate === "function"
      ) {
        navigator.vibrate(10);
      }
    } catch {}
  };

  const advance = (next) => {
    setTransitioning(true);
    setTimeout(() => {
      setAnswers(next);
      setChosen(null);
      setTransitioning(false);
      if (isLast) {
        onComplete(next);
      } else {
        setStep(step + 1);
      }
    }, 220);
  };

  // Single-select choose
  const choose = (value) => {
    if (transitioning) return;
    haptic();
    setChosen(value);
    const next = { ...answers, [q.key]: value };
    advance(next);
  };

  // Multi-select toggle (no auto-advance — user clicks Continue)
  const toggleMulti = (value) => {
    if (transitioning) return;
    haptic();
    setMultiSelections((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const submitMulti = () => {
    if (transitioning) return;
    const next = { ...answers, [q.key]: multiSelections };
    advance(next);
  };

  const skipMulti = () => {
    if (transitioning) return;
    const next = { ...answers, [q.key]: [] };
    advance(next);
  };

  const goBack = () => {
    if (step > 0 && !transitioning) {
      haptic();
      setStep(step - 1);
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  const accentStyle = useMemo(
    () => ({
      transform: "scale(0.98)",
      borderColor: "var(--accent, #d2532a)",
      background: "var(--accent-soft, #fbe8de)",
      color: "var(--accent-ink, #8a3315)",
    }),
    []
  );

  if (!q) return null;

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
          const selected = isMulti
            ? multiSelections.includes(o.value)
            : chosen === o.value;
          return (
            <button
              key={String(o.value)}
              onClick={() =>
                isMulti ? toggleMulti(o.value) : choose(o.value)
              }
              disabled={transitioning}
              className="text-left border rounded-xl p-3 hover:bg-stone-900 hover:text-white transition flex items-center justify-between"
              style={selected ? accentStyle : undefined}
            >
              <span>{o.label}</span>
              {isMulti && (
                <span
                  aria-hidden
                  className="ml-3 text-xs"
                  style={{ opacity: 0.7 }}
                >
                  {selected ? "✓" : ""}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isMulti && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={skipMulti}
            disabled={transitioning}
            className="text-sm opacity-60 hover:opacity-100"
          >
            Skip
          </button>
          <button
            onClick={submitMulti}
            disabled={transitioning}
            className="rounded-xl px-4 py-2 bg-stone-900 text-white hover:opacity-90 transition"
          >
            {multiSelections.length
              ? `Continue (${multiSelections.length})`
              : "Continue"}
          </button>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        {step > 0 ? (
          <button
            onClick={goBack}
            className="text-sm opacity-60 hover:opacity-100"
          >
            ← Back
          </button>
        ) : (
          <span />
        )}
        {isOptional && !isMulti && (
          <button
            onClick={() => advance({ ...answers, [q.key]: null })}
            className="text-sm opacity-60 hover:opacity-100"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
}

/* END OF FILE — last line above is "}" closing Quiz */
