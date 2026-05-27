import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertCircle, ChevronDown, ChevronUp, Calendar, MapPin, Check, 
  ThumbsUp, ThumbsDown, Send, Clock, ShieldAlert, RefreshCw, ChevronRight, ArrowLeft 
} from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import { toast } from 'sonner';

/* ─── Priority Dot Colors ────────────────────────────────────────────── */
const getPriorityColor = (priority) => {
  if (priority === 'critical') return '#EF4444'; // Red
  if (priority === 'high') return '#F59E0B'; // Orange
  if (priority === 'medium') return '#3B82F6'; // Blue
  return '#10B981'; // Green
};

/* ─── Category Emojis Mapping ────────────────────────────────────────── */
const getCategoryEmoji = (category) => {
  const c = (category || '').toLowerCase();
  if (c === 'roads') return '🛣️';
  if (c === 'water') return '🚰';
  if (c === 'electricity') return '⚡';
  if (c === 'sanitation') return '🧹';
  if (c === 'welfare') return '🤝';
  if (c === 'health') return '🏥';
  if (c === 'education') return '🏫';
  if (c === 'agriculture') return '🌾';
  return '📋';
};

export default function MyTickets() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  // Pull to refresh & Gesture states
  const [refreshing, setRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  // Citizen feedback & Reopen flow states
  const [reopenText, setReopenText] = useState('');
  const [showReopenFormId, setShowReopenFormId] = useState(null);

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const fetchTickets = () => {
    let list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    
    // Proactively seed the 3 mock resolved tickets if they don't exist
    const hasMockResolved = list.some(t => t.id === '1045');
    if (!hasMockResolved) {
      const mockResolved = [
        {
          id: '1045',
          category: 'electricity',
          description: 'Streetlight Replacement at 4th block cross road to ensure safety for pedestrians during night hours.',
          status: 'resolved',
          priority: 'medium',
          created_at: new Date('2026-05-16T10:00:00Z').toISOString(),
          sla_deadline: new Date('2026-05-18T10:00:00Z').toISOString(),
          resolved_at: new Date('2026-05-18T14:14:00Z').toISOString(),
          resolved_by: 'Ward Officer Mohan R',
          resolution_text: 'Replaced complete high pressure sodium lamps with energy efficient smart LED fittings.',
          resolution_proof: 'https://picsum.photos/400/200?random=45',
          resolution_lat: '13.0403',
          resolution_lng: '80.2422',
          resolution_address: 'Anna Salai, Teynampet, Chennai',
          ward: '22',
          district: 'Chennai',
          citizen_name: 'KARTHIK RAJ S.',
          feedback: 'positive'
        },
        {
          id: '1046',
          category: 'roads',
          description: 'Pothole Repair - Main Road section in ward 22 causing vehicle bottlenecks.',
          status: 'resolved',
          priority: 'critical',
          created_at: new Date('2026-05-13T10:00:00Z').toISOString(),
          sla_deadline: new Date('2026-05-15T10:00:00Z').toISOString(),
          resolved_at: new Date('2026-05-15T14:14:00Z').toISOString(),
          resolved_by: 'Ward Officer Mohan R',
          resolution_text: 'Filled pot holes using state of the art cold asphalt compounds and compressed fully.',
          resolution_proof: 'https://picsum.photos/400/200?random=46',
          resolution_lat: '13.0403',
          resolution_lng: '80.2422',
          resolution_address: 'Anna Salai, Teynampet, Chennai',
          ward: '22',
          district: 'Chennai',
          citizen_name: 'KARTHIK RAJ S.'
        },
        {
          id: '1047',
          category: 'water',
          description: 'Water Supply Restored in Ward 22. Valve leak caused low pressure.',
          status: 'resolved',
          priority: 'high',
          created_at: new Date('2026-05-09T10:00:00Z').toISOString(),
          sla_deadline: new Date('2026-05-10T10:00:00Z').toISOString(),
          resolved_at: new Date('2026-05-10T14:14:00Z').toISOString(),
          resolved_by: 'Ward Officer Mohan R',
          resolution_text: 'Main municipal water supply gate valve repaired and pressure test verified.',
          resolution_proof: 'https://picsum.photos/400/200?random=47',
          resolution_lat: '13.0403',
          resolution_lng: '80.2422',
          resolution_address: 'Anna Salai, Teynampet, Chennai',
          ward: '22',
          district: 'Chennai',
          citizen_name: 'KARTHIK RAJ S.'
        }
      ];
      list = [...list, ...mockResolved];
      localStorage.setItem('jn_tickets', JSON.stringify(list));
    }
    setTickets(list);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const saveTickets = (updatedList) => {
    localStorage.setItem('jn_tickets', JSON.stringify(updatedList));
    setTickets(updatedList);
  };

  // Pull to Refresh Handlers
  const handleTouchStart = (e) => {
    setStartY(e.touches[0].pageY);
  };

  const handleTouchMove = (e) => {
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY;
    
    // Check if user is scrolled to top and pulls down at least 120px
    if (window.scrollY === 0 && diff > 120 && !refreshing) {
      triggerRefresh();
    }
  };

  const triggerRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      fetchTickets();
      setRefreshing(false);
      toast.success(tLabel("Updated just now", "இப்போதுதான் புதுப்பிக்கப்பட்டது"), {
        position: 'top-center'
      });
    }, 1500);
  };

  // Filter Logic
  const filteredTickets = tickets
    .filter(t => {
      if (filter === 'all') return true;
      if (filter === 'active') return t.status === 'open' || t.status === 'in_progress' || t.status === 'reopened';
      if (filter === 'resolved') return t.status === 'resolved';
      if (filter === 'escalated') return t.status === 'escalated';
      return true;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
    setShowReopenFormId(null);
    setReopenText('');
  };

  // Feedback submit handlers
  const handleFeedbackYes = (ticketId) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, feedback: 'positive' };
      }
      return t;
    });
    saveTickets(updated);
    toast.success(tLabel("Thank you for your feedback! ✓", "உங்கள் கருத்துக்கு நன்றி! ✓"));
  };

  const handleReopenSubmit = (e, ticketId) => {
    e.preventDefault();
    if (reopenText.trim().length < 10) {
      toast.error(tLabel("Please describe details clearly (min 10 characters).", "தயவுசெய்து தெளிவாக விவரிக்கவும் (குறைந்தது 10 எழுத்துக்கள்)."));
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { 
          ...t, 
          status: 'reopened', 
          reopen_notes: reopenText.trim(),
          feedback: 'negative',
          resolved_at: null 
        };
      }
      return t;
    });

    saveTickets(updated);
    setShowReopenFormId(null);
    setReopenText('');
    toast.success(tLabel("Reopen request sent to Ward Officer", "வார்டு அதிகாரிக்கு மீண்டும் திறப்பதற்கான கோரிக்கை அனுப்பப்பட்டது"));
  };

  // SLA Calculation
  const getSlaInfo = (ticket) => {
    if (!ticket.sla_deadline) return { label: 'No SLA', colorClass: 'bg-slate-100 text-slate-500' };
    
    // If ticket is already resolved, show SLA at resolved time or simple green
    if (ticket.status === 'resolved') {
      return { 
        label: tLabel("SLA Met", "SLA நிறைவு"), 
        colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-250/30" 
      };
    }

    const diffMs = new Date(ticket.sla_deadline) - new Date();
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffHrs < 0) {
      return {
        label: tLabel("SLA BREACHED", "SLA மீறப்பட்டது"),
        colorClass: "bg-red-100 text-red-800 border border-red-300 animate-shake",
        isOverdue: true,
        overdueHrs: Math.abs(Math.round(diffHrs))
      };
    }

    if (diffHrs > 24) {
      return {
        label: `${Math.round(diffHrs)} hrs left`,
        colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-200"
      };
    }

    if (diffHrs >= 8 && diffHrs <= 24) {
      return {
        label: `${Math.round(diffHrs)} hrs left`,
        colorClass: "bg-amber-50 text-amber-700 border border-amber-250"
      };
    }

    return {
      label: `${Math.round(diffHrs)} hrs left`,
      colorClass: "bg-red-50 text-red-600 border border-red-200 animate-pulse"
    };
  };

  // Timeline Step calculation
  const getActiveStepIndex = (status) => {
    if (status === 'open') return 1; // Step 2 is active (VAO verifying)
    if (status === 'in_progress' || status === 'reopened') return 2; // Step 3 active (Ward Officer reviewing)
    if (status === 'escalated') return 3; // Step 4 active (BDO reviewing)
    if (status === 'resolved') return 7; // Completed
    return 1;
  };

  const getSteps = (ticket, activeStepIndex) => {
    const createdDate = new Date(ticket.created_at);
    const formatDate = (date) => date.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

    const step1Time = formatDate(createdDate);
    const step2Time = formatDate(new Date(createdDate.getTime() + 20 * 60 * 1000));
    const step3Time = formatDate(new Date(createdDate.getTime() + 45 * 60 * 1000));
    const step4Time = formatDate(new Date(createdDate.getTime() + 90 * 60 * 1000));
    const step5Time = ticket.resolved_at ? formatDate(new Date(ticket.resolved_at)) : '';

    return [
      { role: tLabel("Citizen (You)", "பொதுமக்கள் (நீங்கள்)"), desc: tLabel("Issue Reported", "புகார் பதியப்பட்டது"), time: step1Time },
      { role: tLabel("VAO", "கிராம நிர்வாக அதிகாரி (VAO)"), desc: tLabel("Village verification & site inspection", "கிராம சரிபார்ப்பு மற்றும் தள ஆய்வு"), time: step2Time },
      { role: tLabel("Ward Officer", "வார்டு அதிகாரி"), desc: tLabel("First response & field agent dispatch", "முதல் பதில் மற்றும் கள முகவர் அனுப்புதல்"), time: step3Time },
      { role: tLabel("BDO", "வட்டார வளர்ச்சி அலுவலர் (BDO)"), desc: tLabel("Block level review", "வட்டார அளவிலான ஆய்வு"), time: ticket.status === 'resolved' || ticket.status === 'escalated' ? step4Time : '' },
      { role: tLabel("District Collector", "மாவட்ட ஆட்சியர்"), desc: tLabel("District escalation", "மாவட்ட அளவிலான மேல்முறையீடு"), time: '' },
      { role: tLabel("Department Secretary", "துறைச் செயலாளர்"), desc: tLabel("State level review", "மாநில அளவிலான ஆய்வு"), time: '' },
      { role: tLabel("CM Dashboard", "முதலமைச்சர் கண்காணிப்பு"), desc: tLabel("State monitoring", "மாநில அளவிலான கண்காணிப்பு"), time: ticket.status === 'resolved' ? step5Time : '' }
    ];
  };

  const getProgressBarInfo = (status) => {
    if (status === 'open') {
      return {
        pct: 28,
        label: tLabel("Step 2 of 7 · VAO verifying", "படி 2 / 7 · கிராம நிர்வாக அதிகாரி ஆய்வு செய்கிறார்")
      };
    }
    if (status === 'in_progress' || status === 'reopened') {
      return {
        pct: 43,
        label: tLabel("Step 3 of 7 · Ward Officer reviewing", "படி 3 / 7 · வார்டு அதிகாரி ஆய்வு செய்கிறார்")
      };
    }
    if (status === 'escalated') {
      return {
        pct: 57,
        label: tLabel("Step 4 of 7 · BDO block review", "படி 4 / 7 · பி.டி.ஓ ஆய்வு செய்கிறார்")
      };
    }
    if (status === 'resolved') {
      return {
        pct: 100,
        label: tLabel("Step 7 of 7 · Issue Resolved successfully", "படி 7 / 7 · பிரச்சினை வெற்றிகரமாக தீர்க்கப்பட்டது")
      };
    }
    return {
      pct: 14,
      label: tLabel("Step 1 of 7 · Issue Reported", "படி 1 / 7 · புகார் பதியப்பட்டது")
    };
  };

  // Mock Resolved History data
  const mockRecentlyResolved = [
    { id: '1045', titleEn: 'Streetlight Replacement', titleTa: 'தெருவிளக்கு மாற்றுதல்', date: 'May 18, 2026', dateTa: 'மே 18, 2026' },
    { id: '1046', titleEn: 'Pothole Repair - Main Road', titleTa: 'சாலை பள்ளம் பழுதுபார்த்தல்', date: 'May 15, 2026', dateTa: 'மே 15, 2026' },
    { id: '1047', titleEn: 'Water Supply Restored', titleTa: 'குடிநீர் விநியோகம் சீரமைப்பு', date: 'May 10, 2026', dateTa: 'மே 10, 2026' }
  ];

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      className="pb-24 select-none"
    >
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
            {tLabel("My Complaints", "என் புகார்கள்")}
          </h2>

          <button 
            onClick={triggerRefresh}
            className="w-11 h-11 flex items-center justify-end text-slate-400 hover:text-[#8B1A1A] cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Pull to refresh indicator */}
        {refreshing && (
          <div className="flex justify-center items-center py-2 gap-2 text-xs font-bold text-slate-500 animate-bounce">
            <RefreshCw className="w-3.5 h-3.5 text-[#8B1A1A] animate-spin" />
            <span>{tLabel("Refreshing data...", "புதுப்பிக்கப்படுகிறது...")}</span>
          </div>
        )}

      {/* Filter Tabs */}
      <div className="flex bg-white rounded-xl p-1 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-slate-100 mb-5 overflow-x-auto hide-scrollbar select-none">
        {[
          { id: 'all', en: 'All', ta: 'அனைத்தும்' },
          { id: 'active', en: 'Active', ta: 'செயலில்' },
          { id: 'resolved', en: 'Resolved', ta: 'தீர்வு' },
          { id: 'escalated', en: 'Escalated', ta: 'மேல்முறையீடு' }
        ].map(tab => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 text-center py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                active
                  ? 'bg-[#8B1A1A] text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tLabel(tab.en, tab.ta)}
            </button>
          );
        })}
      </div>

      {/* Grievances List */}
      {filteredTickets.length === 0 ? (
        /* 📋 Centered empty state layout */
        <div className="text-center py-12 px-6 bg-white border border-slate-200/50 rounded-[12px] shadow-sm flex flex-col items-center select-none">
          <span className="text-[48px] block mb-4">📋</span>
          <h4 className="text-sm font-black text-slate-800">
            {tLabel("No active complaints", "செயலில் உள்ள புகார்கள் இல்லை")}
          </h4>
          <p className="text-[12px] text-slate-450 font-bold mt-1 leading-relaxed text-center">
            {tLabel("All your issues have been resolved!", "உங்கள் அனைத்து பிரச்சினைகளும் தீர்க்கப்பட்டுள்ளன!")}
          </p>
          <button
            onClick={() => navigate('/citizen/submit')}
            style={{ backgroundColor: '#8B1A1A' }}
            className="w-full text-white font-extrabold text-xs py-3.5 rounded-xl shadow-md hover:opacity-95 transition-all mt-6 cursor-pointer"
          >
            {tLabel("File a New Issue", "புதிய புகார் செய்")}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTickets.map(ticket => {
            const isExpanded = expandedId === ticket.id;
            const sla = getSlaInfo(ticket);
            const activeStep = getActiveStepIndex(ticket.status);
            const steps = getSteps(ticket, activeStep);
            const progressInfo = getProgressBarInfo(ticket.status);
            const prioColor = getPriorityColor(ticket.priority);

            // Estimated Resolution values
            const createdTime = new Date(ticket.created_at);
            const expectedDate = new Date(createdTime.getTime() + 48 * 60 * 60 * 1000);
            const expectedStr = expectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

            const submittedStr = createdTime.toLocaleString('en-US', { 
              day: 'numeric', 
              month: 'short', 
              year: 'numeric', 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: true 
            });

            return (
              <div
                key={ticket.id}
                id={`ticket-${ticket.id}`}
                className="bg-white rounded-[12px] p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] border border-[#DDE1E7] transition-all cursor-pointer hover:border-slate-350"
                onClick={() => toggleExpand(ticket.id)}
              >
                {/* Header card Details Row */}
                <div className="flex justify-between items-start gap-2 select-none">
                  <div className="flex items-start gap-2">
                    <span 
                      style={{ backgroundColor: prioColor }} 
                      className="w-2.5 h-2.5 rounded-full inline-block shrink-0 mt-1 animate-pulse"
                    />
                    <div>
                      <h4 className="text-[13px] font-black text-slate-800 flex items-center gap-1 leading-none uppercase">
                        <span>{getCategoryEmoji(ticket.category)}</span>
                        <span>{tLabel(ticket.category, ticket.category)}</span>
                        <span className="text-[10px] font-mono text-slate-400 pl-1">#JN-{ticket.id}</span>
                      </h4>
                      <p className="text-[12px] text-slate-400 font-bold mt-1.5 leading-none">
                        Ward {ticket.ward}, Velachery, {ticket.district || 'Chennai'}
                      </p>
                      <p className="text-[10.5px] text-slate-400 font-bold mt-1 leading-none">
                        Submitted: {submittedStr}
                      </p>
                    </div>
                  </div>

                  {/* SLA Badge */}
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border uppercase tracking-wider leading-none shadow-xs ${sla.colorClass}`}>
                      {sla.label}
                    </span>
                  </div>
                </div>

                {/* Estimated Resolution / Overdue row */}
                <div className="flex items-center gap-1.5 mt-3 select-none text-[12px] font-bold">
                  <Clock className={`w-3.5 h-3.5 ${sla.isOverdue ? 'text-red-600' : 'text-slate-400'}`} />
                  {sla.isOverdue ? (
                    <span className="text-red-650">Overdue by {sla.overdueHrs} hours</span>
                  ) : (
                    <span className="text-slate-400">Expected resolution: {expectedStr}</span>
                  )}
                </div>

                {/* Complaint short summary */}
                <p className="text-xs text-slate-550 font-bold mt-2.5 line-clamp-1 leading-relaxed">
                  {ticket.description}
                </p>

                {/* Expand / Collapse chevron indicator */}
                <div className="flex justify-center mt-3">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-300" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                {/* EXPANDABLE PIPELINE TRACKER */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden mt-3 pt-3 border-t border-slate-100/70 space-y-5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Description & image block */}
                      <div className="space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                            {tLabel("CITIZEN GIVEN DESCRIPTION", "வழங்கப்பட்ட புகார் விளக்கம்")}
                          </span>
                          <p className="text-xs font-bold text-slate-700 mt-1 leading-relaxed">
                            {ticket.description}
                          </p>
                        </div>
                        {ticket.photo && (
                          <div className="w-full aspect-video rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                            <img src={ticket.photo} alt="Citizen evidence proof" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* ══ PROGRESS BAR below title ══ */}
                      <div className="space-y-2 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                          {tLabel("TRACKING COMPLETION STATUS", "புகார் நிலை அடைவு")}
                        </span>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${progressInfo.pct}%`, backgroundColor: '#8B1A1A' }}
                            className="h-full rounded-full transition-all duration-500"
                          />
                        </div>
                        <p className="text-[11px] font-black text-[#8B1A1A] tracking-wide mt-1">
                          {progressInfo.label}
                        </p>
                      </div>

                      {/* ══ 7-STEP LIVE ROUTING PIPELINE ══ */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                          {tLabel("OFFICIAL 7-STAGE PIPELINE HIERARCHY", "அதிகாரப்பூர்வ 7-படி காலவரிசை")}
                        </span>
                        
                        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                          {steps.map((step, idx) => {
                            const isCompleted = idx < activeStep;
                            const isActive = idx === activeStep;
                            const isUpcoming = idx > activeStep;

                            let dotBg = 'bg-slate-200 border border-slate-350';
                            let dotContent = null;
                            let lineStyle = 'bg-slate-150 border-dashed border-l';
                            let cardBg = 'bg-slate-50 border border-slate-200/50';
                            let stepBadge = null;

                            if (isCompleted) {
                              dotBg = 'bg-[#8B1A1A] text-white flex items-center justify-center';
                              dotContent = <span className="text-[9px] font-black">✓</span>;
                              lineStyle = 'bg-[#8B1A1A]';
                              cardBg = 'bg-white border border-[#DDE1E7]';
                            } else if (isActive) {
                              dotBg = 'bg-amber-500 text-white flex items-center justify-center relative';
                              dotContent = (
                                <>
                                  <Clock className="w-2.5 h-2.5 text-white" />
                                  <span className="absolute -inset-1 rounded-full border-2 border-amber-500 animate-ping opacity-75" />
                                </>
                              );
                              lineStyle = 'bg-amber-500';
                              cardBg = 'bg-[#FFF9F2] border border-amber-250 border-l-[3px] border-l-amber-500';
                              stepBadge = (
                                <span className="text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300/40 px-2 py-0.5 rounded-full uppercase shrink-0">
                                  {ticket.status === 'in_progress' ? tLabel("In Progress", "நடவடிக்கையில்") : tLabel("Pending", "நிலுவையில்")}
                                </span>
                              );
                            } else {
                              cardBg = 'bg-slate-50/70 border border-slate-100 opacity-60';
                            }

                            return (
                              <div key={idx} className="relative flex flex-col items-start select-none">
                                {/* Connecting Line */}
                                {idx < steps.length - 1 && (
                                  <div 
                                    style={{ left: '-18px' }}
                                    className={`absolute top-5 bottom-0 w-[2px] z-0 ${lineStyle}`}
                                  />
                                )}

                                {/* Dot circle */}
                                <div 
                                  style={{ left: '-24px' }}
                                  className={`absolute top-1.5 w-[14px] h-[14px] rounded-full border-2 border-white flex items-center justify-center z-10 ${dotBg}`}
                                >
                                  {dotContent}
                                </div>

                                {/* Content Details Card */}
                                <div className={`w-full rounded-xl p-3 flex justify-between items-center ${cardBg}`}>
                                  <div>
                                    <h5 className="text-[13px] font-black text-slate-800 dark:text-slate-100">
                                      {step.role}
                                    </h5>
                                    <span className="text-[11px] text-slate-400 font-bold block mt-0.5 leading-tight">
                                      {step.desc}
                                    </span>
                                  </div>

                                  <div className="flex flex-col items-end gap-1 shrink-0 pl-2">
                                    {step.time && (
                                      <span className="text-[10px] text-slate-400 font-bold">
                                        {step.time}
                                      </span>
                                    )}
                                    {stepBadge}
                                  </div>
                                </div>

                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* ══ RESOLUTION PROOF SECTION (Resolved cards only) ══ */}
                      {ticket.status === 'resolved' && (
                        <div className="border-t border-slate-200/50 pt-4 space-y-4">
                          
                          {/* Banner */}
                          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2.5 select-none shadow-xs">
                            <span className="text-xl">✅</span>
                            <div>
                              <h4 className="text-[16px] font-black text-emerald-800 tracking-wide leading-tight">
                                {tLabel("Issue Resolved", "பிரச்சினை தீர்க்கப்பட்டது")}
                              </h4>
                              <p className="text-[11px] font-bold text-emerald-700/80 mt-0.5">
                                {tLabel(
                                  "Resolved on 27 May 2026, 2:14 PM by Ward Officer Mohan R",
                                  "27 மே 2026, 2:14 PM அன்று வார்டு அதிகாரி மோகன் R தீர்த்தார்"
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Proof photo */}
                          <div className="space-y-1.5 select-none">
                            <div className="relative w-full h-[180px] rounded-xl overflow-hidden shadow-sm bg-slate-900">
                              <img 
                                src="https://picsum.photos/400/200?random=42" 
                                alt="Ward Officer proof" 
                                className="w-full h-full object-cover" 
                              />
                            </div>
                            
                            <div className="space-y-0.5 pl-1 text-[11px]">
                              <p className="font-extrabold text-slate-700">
                                📷 Geo-tagged proof photo by Ward Officer
                              </p>
                              <p className="font-bold text-slate-400">
                                📍 Anna Salai, Teynampet, Chennai · 27 May 2026 · 2:14 PM IST
                              </p>
                            </div>
                          </div>

                          {/* GIS mini resolution map */}
                          <div className="space-y-1.5">
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">
                              {tLabel("GIS RESOLUTION MAP LOCATION", "வழங்கப்பட்ட இருப்பிட வரைபடம்")}
                            </span>
                            <div className="bg-white border border-slate-200 p-2 rounded-xl">
                              <ErrorBoundary>
                                <div style={{ height: '130px', width: '100%' }}>
                                  <MapContainer
                                    center={[parseFloat(ticket.resolution_lat || '13.0403'), parseFloat(ticket.resolution_lng || '80.2422')]}
                                    zoom={14}
                                    zoomControl={false}
                                    scrollWheelZoom={false}
                                    dragging={false}
                                    doubleClickZoom={false}
                                    style={{ height: '100%', width: '100%' }}
                                  >
                                    <TileLayer
                                      url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                                      attribution='&copy; Carto'
                                    />
                                    <CircleMarker
                                      center={[parseFloat(ticket.resolution_lat || '13.0403'), parseFloat(ticket.resolution_lng || '80.2422')]}
                                      radius={7}
                                      fillColor="#E53935"
                                      color="white"
                                      weight={2}
                                      fillOpacity={0.9}
                                    />
                                  </MapContainer>
                                </div>
                              </ErrorBoundary>
                            </div>
                          </div>

                          {/* FEEDBACK CORNER */}
                          <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 space-y-3">
                            <h5 className="font-black text-slate-800 text-xs text-center select-none">
                              {tLabel("Was your issue properly resolved?", "உங்கள் பிரச்சினை சரியாக தீர்க்கப்பட்டதா?")}
                            </h5>

                            {ticket.feedback ? (
                              <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 text-center text-xs font-black text-slate-700 flex items-center justify-center gap-2 select-none">
                                {ticket.feedback === 'positive' ? (
                                  <span className="text-[#4CAF50]">
                                    {tLabel("Thank you for your feedback! ✓", "உங்கள் கருத்துக்கு நன்றி! ✓")}
                                  </span>
                                ) : (
                                  <span className="text-purple-650">
                                    {tLabel("Complaint reopened 🗘", "புகார் மீண்டும் திறக்கப்பட்டது 🗘")}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {showReopenFormId === ticket.id ? (
                                  <form onSubmit={(e) => handleReopenSubmit(e, ticket.id)} className="space-y-2">
                                    <textarea
                                      required
                                      rows={2}
                                      minLength={10}
                                      value={reopenText}
                                      onChange={(e) => setReopenText(e.target.value)}
                                      placeholder={tLabel("Why is this not resolved?", "ஏன் தீர்க்கப்படவில்லை என்று விவரிக்கவும்")}
                                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#8B1A1A] outline-none p-3 rounded-xl text-slate-700 text-xs font-bold resize-none"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        type="button"
                                        onClick={() => setShowReopenFormId(null)}
                                        className="h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 font-extrabold text-[11px] uppercase cursor-pointer"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="submit"
                                        style={{ backgroundColor: '#8B1A1A' }}
                                        className="h-11 flex-1 rounded-xl text-white font-extrabold text-[11px] uppercase flex items-center justify-center gap-1 cursor-pointer"
                                      >
                                        <Send className="w-3.5 h-3.5 text-white/95" />
                                        <span>Submit Reopen Request</span>
                                      </button>
                                    </div>
                                  </form>
                                ) : (
                                  <div className="grid grid-cols-2 gap-2.5">
                                    {/* Yes Button */}
                                    <button
                                      type="button"
                                      onClick={() => handleFeedbackYes(ticket.id)}
                                      className="h-11 bg-white hover:bg-emerald-50 text-[#4CAF50] border border-[#4CAF50]/30 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                    >
                                      <ThumbsUp className="w-4 h-4" />
                                      <span>{tLabel("Yes, satisfied", "ஆம், திருப்தி")}</span>
                                    </button>

                                    {/* No Button */}
                                    <button
                                      type="button"
                                      onClick={() => setShowReopenFormId(ticket.id)}
                                      className="h-11 bg-white hover:bg-purple-50 text-red-600 border border-red-200 font-extrabold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                                    >
                                      <ThumbsDown className="w-4 h-4" />
                                      <span>{tLabel("No, reopen", "இல்லை, மீண்டும் திற")}</span>
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>

                        </div>
                      )}

                      {/* ══ REOPENED STATUS BOX ══ */}
                      {ticket.status === 'reopened' && ticket.reopen_notes && (
                        <div className="bg-purple-50 border border-purple-150 rounded-2xl p-4 space-y-2 text-purple-900 select-none">
                          <div className="flex items-center gap-2 font-extrabold text-xs text-purple-800">
                            <ShieldAlert className="w-4 h-4 text-purple-750 shrink-0" />
                            <span>Reopen request registered</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">Citizen Reopen observation notes</span>
                            <p className="text-xs font-bold text-slate-700 bg-white p-3 rounded-xl border border-purple-200/50">{ticket.reopen_notes}</p>
                          </div>
                          <p className="text-[10px] text-purple-700 font-bold block pt-1 leading-normal">
                            🗘 Grievance has been sent back to Ward Officer Mohan R for priority check.
                          </p>
                        </div>
                      )}

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}
        </div>
      )}

      {/* ══ RECENTLY RESOLVED HISTORY LIST ══ */}
      {tickets.length > 0 && (
        <div className="mt-8 space-y-3 pb-8 select-none">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest block">
            {tLabel("Recently Resolved Complaints", "சமீபத்தில் தீர்க்கப்பட்ட புகார்கள்")}
          </span>
          
          <div className="space-y-3">
            {mockRecentlyResolved.map(hist => (
              <div
                key={hist.id}
                onClick={() => {
                  setExpandedId(hist.id);
                  setFilter('all');
                  setTimeout(() => {
                    document.getElementById(`ticket-${hist.id}`)?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-white rounded-[12px] p-3.5 border border-[#DDE1E7] flex items-center justify-between shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:border-slate-350 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black shrink-0 border border-emerald-100 shadow-xs">
                    ✓
                  </div>
                  <div>
                    <h5 className="text-[13px] font-black text-slate-800">
                      {tLabel(hist.titleEn, hist.titleTa)}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                      {tLabel(`Resolved on ${hist.date}`, `${hist.dateTa} அன்று தீர்க்கப்பட்டது`)}
                    </span>
                  </div>
                </div>
                
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
      </div>

    </div>
  );
}
