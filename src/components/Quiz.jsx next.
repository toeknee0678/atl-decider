import { useState } from "react";
import { questions } from "../data/questions";

export default function Quiz({ onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const q = questions[step];

  const choose = (value) => {
    const next = { ...answers, [q.key]: value };
    setAnswers(next);
    if (step + 1 === questions.length) {
      onComplete(next);
    } else {
      setStep(step + 1);
    }
  };

  const progress = ((step + 1) / questions.length) * 100;

  return (
    <div className="bg-white border rounded-2xl p-6">
      <div className="mb-4">
        <p className="text-xs opacity-60 mb-1">
          Question {step + 1} of {questions.length}
        </p>
        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-stone-900 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-4">{q.label}</h2>

      <div className="grid gap-2">
        {q.options.map((o) => (
          <button
            key={String(o.value)}
            onClick={() => choose(o.value)}
            className="text-left border rounded-xl p-3 hover:bg-stone-900 hover:text-white transition"
          >
            {o.label}
          </button>
        ))}
      </div>

      {step > 0 && (
        <button
          onClick={() => setStep(step - 1)}
          className="mt-4 text-sm opacity-60 hover:opacity-100"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
