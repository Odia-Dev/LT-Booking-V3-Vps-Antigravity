"use client";

import React, { useState } from "react";
import LeadForm, { LeadFormType } from "../../components/LeadForm";

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState<LeadFormType>("GENERAL");

  const tabs: { label: string; value: LeadFormType; icon: string }[] = [
    { label: "General Enquiry", value: "GENERAL", icon: "💬" },
    { label: "Call Back Request", value: "CALL_BACK", icon: "📞" },
    { label: "Price Quote", value: "PRICE_QUOTE", icon: "💰" },
    { label: "Brochure Download", value: "BROCHURE", icon: "📄" },
    { label: "Finance & Loan", value: "FINANCE", icon: "🏦" },
    { label: "Exchange Valuation", value: "EXCHANGE", icon: "🚗" },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#eb0a1e]">
            Contact Dealership
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            How Can We Help You?
          </h1>
          <p className="text-sm text-neutral-400 leading-relaxed font-light">
            Select the type of enquiry below, and we will get back to you within 24 hours.
          </p>
        </div>

        {/* Tab Selectors */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-2 ${
                activeTab === tab.value
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-[#18181b]/35 text-neutral-400 border-neutral-800/80 hover:text-white hover:border-neutral-700"
              }`}
            >
              <span className="text-2xl">{tab.icon}</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wider">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Main Content: Form */}
        <div className="max-w-3xl mx-auto">
          <LeadForm formType={activeTab} key={activeTab} />
        </div>
      </div>
    </div>
  );
}
