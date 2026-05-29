"use client"; // needs client state to expand/collapse answers

import { useState } from "react";
import type { Faq } from "@/lib/types";

/** Click a question to reveal its answer; one open at a time. */
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-foreground/10 overflow-hidden rounded-2xl border border-foreground/10">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        const answerId = `faq-answer-${faq.id}`;
        return (
          <div key={faq.id}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpenId(isOpen ? null : faq.id)}
            >
              <span>{faq.question}</span>
              <span aria-hidden="true" className="text-xl leading-none text-brand">
                {isOpen ? "−" : "+"}
              </span>
            </button>
            {isOpen && (
              <p
                id={answerId}
                className="px-5 pb-5 leading-relaxed text-foreground/70"
              >
                {faq.answer}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
