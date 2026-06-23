"use client";

import React, { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FaqSectionProps {
  faqs: FAQItem[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="rounded-lg border border-[#27272a]/60 bg-[#18181b]/10 overflow-hidden"
        >
          <button
            onClick={() => setActiveFaq((prev) => (prev === index ? null : index))}
            className="w-full text-left p-6 font-semibold flex justify-between items-center text-white hover:bg-[#18181b]/30 transition-colors"
          >
            <span>{faq.question}</span>
            <span className="text-xl text-[#71717a]">
              {activeFaq === index ? "−" : "+"}
            </span>
          </button>
          {activeFaq === index && (
            <div className="p-6 pt-0 border-t border-[#27272a]/30 text-sm text-[#a1a1aa] font-light leading-relaxed">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
