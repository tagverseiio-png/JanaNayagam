import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, ShieldAlert, UserCheck, Building2, Landmark, FileText, Award, ArrowLeft } from 'lucide-react';

const steps = [
  {
    num: 1,
    role: "You (Citizen)",
    tamilRole: "நீங்கள் (குடிமகன்)",
    desc: "Submit complaint",
    tamilDesc: "புகாரைச் சமர்ப்பிக்கவும்",
    sla: "Instant",
    tamilSla: "உடனடி",
    color: "#3B82F6", // Blue
    icon: <User className="w-5 h-5 text-white" />
  },
  {
    num: 2,
    role: "VAO",
    tamilRole: "கிராம நிர்வாக அலுவலர் (VAO)",
    desc: "Village verification",
    tamilDesc: "கிராம கள சரிபார்ப்பு",
    sla: "2 hours",
    tamilSla: "2 மணிநேரம்",
    color: "#F59E0B", // Amber
    icon: <ShieldAlert className="w-5 h-5 text-white" />
  },
  {
    num: 3,
    role: "Ward Officer",
    tamilRole: "வார்டு அதிகாரி",
    desc: "First review & assignment",
    tamilDesc: "முதல் ஆய்வு மற்றும் நியமனம்",
    sla: "4 hours SLA",
    tamilSla: "4 மணிநேர கெடு (SLA)",
    color: "#6366F1", // Indigo
    icon: <UserCheck className="w-5 h-5 text-white" />
  },
  {
    num: 4,
    role: "BDO",
    tamilRole: "வட்டார வளர்ச்சி அலுவலர் (BDO)",
    desc: "Escalation tier 1",
    tamilDesc: "முதல் கட்ட மேல்முறையீடு",
    sla: "If unresolved 24hrs",
    tamilSla: "24 மணிநேரத்தில் தீர்க்கப்படாவிடில்",
    color: "#14B8A6", // Teal
    icon: <Building2 className="w-5 h-5 text-white" />
  },
  {
    num: 5,
    role: "District Collector",
    tamilRole: "மாவட்ட ஆட்சியர்",
    desc: "Escalation tier 2",
    tamilDesc: "இரண்டாம் கட்ட மேல்முறையீடு",
    sla: "If unresolved 72hrs",
    tamilSla: "72 மணிநேரத்தில் தீர்க்கப்படாவிடில்",
    color: "#8B5CF6", // Purple
    icon: <Landmark className="w-5 h-5 text-white" />
  },
  {
    num: 6,
    role: "Dept Secretary",
    tamilRole: "துறைச் செயலாளர்",
    desc: "Strategic coordination",
    tamilDesc: "வியூக ஒருங்கிணைப்பு",
    sla: "Critical issues",
    tamilSla: "முக்கிய சிக்கல்கள்",
    color: "#F97316", // Orange
    icon: <FileText className="w-5 h-5 text-white" />
  },
  {
    num: 7,
    role: "Chief Minister",
    tamilRole: "முதலமைச்சர் (CM)",
    desc: "Supreme oversight",
    tamilDesc: "உயர் கட்டளை கண்காணிப்பு",
    sla: "State emergency action",
    tamilSla: "அவசரக்கால நடவடிக்கை",
    color: "#8B1A1A", // Dark Red
    icon: <Award className="w-5 h-5 text-white" />
  }
];

export default function EscalationHierarchy() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  return (
    <div className="pb-24 select-none">
      {/* ══ PAGE HEADER ══ */}
      <div className="bg-white sticky top-0 z-50 border-b border-[#DDE1E7] shrink-0">
        <div className="h-14 px-4 flex justify-between items-center w-full">
          <button
            onClick={() => navigate('/citizen')}
            className="w-11 h-11 flex items-center justify-start text-[#8B1A1A] cursor-pointer"
            style={{ minWidth: '44px', minHeight: '44px' }}
            title={tLabel("Back to Home", "முகப்புக்குத் திரும்பு")}
          >
            <ArrowLeft className="w-6 h-6 text-[#8B1A1A]" />
          </button>

          <h2 className="text-base font-black text-slate-800 tracking-wide">
            {tLabel("Escalation Matrix", "மேல்முறையீட்டு கட்டமைப்பு")}
          </h2>

          <div className="w-11 h-11"></div>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Title */}
        <div className="mb-6 select-none">
          <h2 className="text-xl font-black text-[#8B1A1A]">
            {tLabel("How your complaint travels", "உங்கள் புகார் எப்படி செல்கிறது")}
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-1">
            {tLabel("Statewide digital escalation matrix", "மாநிலம் தழுவிய டிஜிட்டல் மேல்முறையீட்டு கட்டமைப்பு")}
          </p>
        </div>

      {/* Timeline flowchart */}
      <div className="relative pl-6 space-y-8 select-none">
        
        {/* Central connecting line */}
        <div className="absolute left-[33px] top-6 bottom-6 w-0.5 bg-slate-200"></div>

        {steps.map((step, idx) => (
          <div key={step.num} className="relative flex gap-4 items-start">
            
            {/* Circle Icon and Step Badge */}
            <div
              style={{ backgroundColor: step.color }}
              className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-md shrink-0 transition-transform hover:scale-105"
            >
              {step.icon}
              {/* Step number badge */}
              <div className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-xs">
                <span className="text-[9px] font-black text-slate-700">{step.num}</span>
              </div>
            </div>

            {/* Information Card */}
            <div className="flex-1 bg-white rounded-xl p-3.5 border border-slate-100/80 shadow-[0_2px_6px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-start gap-1">
                <h3 className="font-extrabold text-sm text-[#8B1A1A]">
                  {tLabel(step.role, step.tamilRole)}
                </h3>
                <span style={{ color: step.color, background: step.color + '14', border: `1px solid ${step.color}30` }} className="text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full shrink-0">
                  {tLabel(step.sla, step.tamilSla)}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {tLabel(step.desc, step.tamilDesc)}
              </p>
            </div>
            
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-8 bg-[#8B1A1A]/5 border border-[#8B1A1A]/10 rounded-xl p-4 text-center select-none shadow-inner">
        <p className="text-xs text-[#8B1A1A] font-extrabold">
          {tLabel("Your complaint is tracked at every step.", "உங்கள் புகார் ஒவ்வொரு கட்டத்திலும் கண்காணிக்கப்படுகிறது.")}
        </p>
      </div>
      </div>
    </div>
  );
}
