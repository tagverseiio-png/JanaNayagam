import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  Users, AlertTriangle, RefreshCw, ArrowUpRight, Check, X, Camera, Info, ShieldAlert, Star, MapPin
} from 'lucide-react';
import TicketCard from '../../shared/components/TicketCard';
import GeoCamera from '../../shared/components/GeoCamera';

export default function TicketInbox() {
  const { t } = useTranslation();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam) {
      setFilter(filterParam);
    }
  }, [location.search]);

  // Modals state
  const [activeTicket, setActiveTicket] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [escalateModalOpen, setEscalateModalOpen] = useState(false);

  // Form states
  const [agentName, setAgentName] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionPhoto, setResolutionPhoto] = useState('');
  
  // 3-Step Resolution Flow states
  const [resolveStep, setResolveStep] = useState(1);
  const [resolutionLat, setResolutionLat] = useState('13.0827');
  const [resolutionLng, setResolutionLng] = useState('80.2707');
  const [resolutionAddress, setResolutionAddress] = useState('');
  const [showGeoCamera, setShowGeoCamera] = useState(false);

  // Touch swipe states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const fetchTickets = () => {
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    setTickets(list);
  };

  const handleAction = (ticketId, action) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    setActiveTicket(ticket);
    
    if (action === 'assign') {
      setAssignModalOpen(true);
    } else if (action === 'escalate') {
      setEscalateModalOpen(true);
    } else if (action === 'close' || action === 'resolve') {
      setResolveStep(1);
      setResolveModalOpen(true);
    } else if (action === 'view') {
      toast.info(`Grievance Description: ${ticket.description}`);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSaveTickets = (updatedList) => {
    localStorage.setItem('jn_tickets', JSON.stringify(updatedList));
    setTickets(updatedList);
  };

  // Change priority directly
  const handlePriorityChange = (ticketId, priority) => {
    const updated = tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return { ...ticket, priority: priority.toLowerCase() };
      }
      return ticket;
    });
    handleSaveTickets(updated);
    toast.success(`Priority updated to: ${priority}`);
  };

  // Status changes handler
  const handleStatusChange = (ticketId, status) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    if (status === 'resolved') {
      setActiveTicket(ticket);
      setResolveStep(1);
      setResolveModalOpen(true);
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status: status.toLowerCase() };
      }
      return t;
    });
    handleSaveTickets(updated);
    toast.success(`Status changed: ${status.replace('_', ' ')}`);
  };

  // Geotag / Agent assignment
  const handleAssignAgentSubmit = (e) => {
    e.preventDefault();
    if (!agentName.trim()) {
      toast.error('Agent Name is required');
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { 
          ...t, 
          status: 'in_progress',
          assigned_agent: agentName,
          assignment_notes: assignmentNotes
        };
      }
      return t;
    });

    handleSaveTickets(updated);
    setAssignModalOpen(false);
    setAgentName('');
    setAssignmentNotes('');
    toast.success(`Field Agent ${agentName} Dispatched`);
  };

  // Resolution submit
  const handleResolveSubmit = (e) => {
    if (e) e.preventDefault();
    if (!resolutionNotes.trim()) {
      toast.error('Resolution observations are required');
      return;
    }
    if (!resolutionPhoto) {
      toast.error('Photo proof is required to resolve complaints');
      return;
    }

    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { 
          ...t, 
          status: 'resolved',
          resolution_text: resolutionNotes,
          resolution_proof: resolutionPhoto,
          resolution_lat: resolutionLat,
          resolution_lng: resolutionLng,
          resolution_address: resolutionAddress || 'Velachery, Chennai',
          resolved_by: localStorage.getItem('jn_name') || 'WARD OFFICER',
          resolved_at: new Date().toISOString()
        };
      }
      return t;
    });

    handleSaveTickets(updated);
    setResolveModalOpen(false);
    setResolutionNotes('');
    setResolutionPhoto('');
    setResolveStep(1);
    toast.success('Complaint marked as resolved successfully with stamped proof');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setResolutionPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Escalation submit
  const handleEscalateConfirm = () => {
    const updated = tickets.map(t => {
      if (t.id === activeTicket.id) {
        return { ...t, status: 'escalated' };
      }
      return t;
    });
    handleSaveTickets(updated);
    setEscalateModalOpen(false);
    toast.success('Complaint escalated to Block Development Officer (BDO)');
  };

  const getEscalateConfirmText = () => {
    const isTamil = t('app_name') === 'ஜனநாயகம்';
    return isTamil ? 'நிச்சயமா? இது BDO-க்கு அனுப்பப்படும்.' : 'Are you sure? This escalates to BDO.';
  };

  // Notify MLA handler
  const handleNotifyMLA = (ticketId) => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, mla_notified: true };
      }
      return t;
    });
    handleSaveTickets(updated);
    toast.success('Member of Legislative Assembly (MLA) has been notified');
  };

  // Filter list
  const filtered = tickets.filter(ticket => {
    if (filter === 'all') return true;
    if (filter === 'open') return ticket.status === 'open';
    if (filter === 'in_progress') return ticket.status === 'in_progress';
    if (filter === 'escalated') return ticket.status === 'escalated';
    if (filter === 'resolved') return ticket.status === 'resolved';
    return true;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-12"
    >
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          Ward Grievances Inbox
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-0.5">
          Manage, prioritize, and resolve grievances
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex rounded-2xl p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner overflow-x-auto hide-scrollbar">
        {['all', 'open', 'in_progress', 'escalated', 'resolved'].map(f => {
          const isActive = filter === f;
          const label = f === 'all' ? 'All' : f === 'in_progress' ? 'In Progress' : t(f);
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#003366] text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400 font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6">
          <AlertTriangle className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-sm">No tickets found matching selection</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filtered.map(ticket => {
            const hoursOld = (new Date() - new Date(ticket.created_at)) / (1000 * 60 * 60);
            const isOld = hoursOld > 20;

            return (
              <div 
                key={ticket.id}
                onTouchStart={(e) => {
                  setTouchEnd(null);
                  setTouchStart(e.targetTouches[0].clientX);
                }}
                onTouchMove={(e) => {
                  setTouchEnd(e.targetTouches[0].clientX);
                }}
                onTouchEnd={() => {
                  if (!touchStart || !touchEnd) return;
                  const distance = touchStart - touchEnd;
                  const minSwipeDistance = 60;
                  const isLeftSwipe = distance > minSwipeDistance;
                  const isRightSwipe = distance < -minSwipeDistance;

                  const isElderly = localStorage.getItem('jn_elderly_mode') === 'true';
                  if (isElderly) return;

                  if (isLeftSwipe && ticket.status !== 'resolved') {
                    setActiveTicket(ticket);
                    setEscalateModalOpen(true);
                    toast.info(`Swiped left to escalate ticket #${ticket.id}`);
                  } else if (isRightSwipe && ticket.status !== 'resolved') {
                    setActiveTicket(ticket);
                    setResolveStep(1);
                    setResolveModalOpen(true);
                    toast.info(`Swiped right to resolve ticket #${ticket.id}`);
                  }
                }}
                className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4 transition-all duration-300 ${
                  isOld 
                    ? 'bg-amber-50/70 border-amber-300 dark:bg-amber-950/10 dark:border-amber-900/50' 
                    : ''
                }`}
              >
                {/* Header card details */}
                <TicketCard 
                  ticket={ticket}
                  role="ward_officer"
                  onAction={(id, action) => handleAction(id, action)}
                />

                {/* Inline Action Controls Panel (only for unresolved tickets) */}
                {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
                    
                    {/* 1. Dispatch Agent Button */}
                    <button
                      onClick={() => { setActiveTicket(ticket); setAssignModalOpen(true); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 hover:bg-slate-50 text-[10.5px] font-black uppercase text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                      <Users className="w-3.5 h-3.5 text-[#003366]" />
                      <span>Assign Agent</span>
                    </button>

                    {/* 2. Priority Select */}
                    <div className="relative">
                      <select
                        value={ticket.priority}
                        onChange={(e) => handlePriorityChange(ticket.id, e.target.value)}
                        className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-[10.5px] font-black uppercase text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer appearance-none outline-none"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                        <option value="critical">Critical Priority</option>
                      </select>
                    </div>

                    {/* 3. Status Select */}
                    <div className="relative">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="w-full text-center py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-[10.5px] font-black uppercase text-slate-700 dark:text-slate-300 shadow-sm cursor-pointer appearance-none outline-none"
                      >
                        <option value="open">Under Review</option>
                        <option value="in_progress">Agent Dispatched</option>
                        <option value="resolved">Mark Resolved</option>
                      </select>
                    </div>

                    {/* 4. Escalate Button */}
                    <button
                      onClick={() => { setActiveTicket(ticket); setEscalateModalOpen(true); }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/20 text-[10.5px] font-black uppercase text-rose-600 dark:text-rose-400 hover:bg-rose-100 shadow-sm"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 shrink-0" />
                      <span>Escalate BDO</span>
                    </button>

                    {/* 5. Notify MLA Button */}
                    <button
                      onClick={() => handleNotifyMLA(ticket.id)}
                      className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border text-[10.5px] font-black uppercase shadow-sm transition-all ${
                        ticket.mla_notified
                          ? 'bg-[#1B5E20] border-[#1B5E20] text-white'
                          : 'bg-emerald-50 border-emerald-250 text-[#1B5E20] hover:bg-emerald-100'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${ticket.mla_notified ? 'fill-white' : ''}`} />
                      <span>{t('notify_mla')}</span>
                    </button>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL 1: Assign Agent */}
      <AnimatePresence>
        {assignModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-[#003366] dark:text-slate-100 text-base uppercase">
                  Dispatch Field Agent
                </h4>
                <button onClick={() => setAssignModalOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleAssignAgentSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Agent Name
                  </label>
                  <input
                    type="text"
                    required
                    value={agentName}
                    onChange={(e) => setAgentName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Section Officer)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-sm shadow-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1 block">
                    Dispatch Instructions / Notes
                  </label>
                  <textarea
                    rows={3}
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    placeholder="Provide specific guidelines for field inspection..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#003366] hover:bg-[#FF6600] text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md"
                >
                  Confirm Dispatch
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Mark Resolved */}
      <AnimatePresence>
        {resolveModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 select-none">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                <h4 className="font-black text-emerald-700 dark:text-emerald-400 text-base uppercase">
                  Verify Resolution Proof (Step {resolveStep}/3)
                </h4>
                <button onClick={() => { setResolveModalOpen(false); setResolveStep(1); }}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Step 1: Observations Notes */}
              {resolveStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Resolution Observations Notes (Required)
                    </label>
                    <textarea
                      required
                      rows={4}
                      maxLength={300}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Detail specific repairs, parts replaced, or works completed (min 10 chars, max 300)..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#003366] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm resize-none leading-relaxed font-bold"
                    ></textarea>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pl-1 pt-0.5">
                      <span>Min 10 characters</span>
                      <span>{resolutionNotes.length}/300</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResolveModalOpen(false)}
                      className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={resolutionNotes.trim().length < 10}
                      onClick={() => setResolveStep(2)}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Next: Capture Photo →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Geo-Tagged Photo Proof */}
              {resolveStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Geo-Tagged Camera Verification (Required)
                    </label>
                    
                    <button
                      type="button"
                      onClick={() => setShowGeoCamera(true)}
                      className="w-full bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-emerald-600 animate-pulse" />
                      <span className="font-extrabold text-xs text-slate-700">Launch Resolution Camera</span>
                      <span className="text-[10px] font-bold text-slate-400">Captures frame coordinates and geocodes details</span>
                    </button>

                    {resolutionPhoto && (
                      <div className="relative w-full aspect-video rounded-xl border border-slate-200 overflow-hidden shadow-md mt-2 group select-none">
                        <img src={resolutionPhoto} alt="Resolution proof" className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-[#4CAF50] text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                          <MapPin className="w-2.5 h-2.5 text-white" />
                          <span>📍 LOCATION VERIFIED</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResolveStep(1)}
                      className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!resolutionPhoto}
                      onClick={() => setResolveStep(3)}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      Next: Stamp GPS Coords →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Stamping details */}
              {resolveStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 block">
                      Resolution Metadatas & GPS Stamp
                    </label>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center gap-2 select-none text-[10px] font-extrabold text-[#4CAF50] uppercase tracking-wider">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>GIS Coordinate Lock Successful</span>
                      </div>
                      
                      <div className="space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">VERIFIED COORDINATES</span>
                          <p className="font-mono font-black text-slate-800">{resolutionLat}°N, {resolutionLng}°E</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">GEOCODED MUNICIPAL STREET</span>
                          <p className="font-bold text-slate-700 leading-normal">{resolutionAddress || 'Anna Salai, Chennai, Tamil Nadu'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 border-t border-slate-200/50 pt-2">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">RESOLVED BY</span>
                            <p className="font-black text-slate-800">{localStorage.getItem('jn_name') || 'WARD OFFICER'}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block tracking-wider uppercase">TIMESTAMP</span>
                            <p className="font-black text-slate-800">{new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setResolveStep(2)}
                      className="py-3 px-4 rounded-xl border border-slate-200 text-slate-500 font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleResolveSubmit}
                      className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                    >
                      ✓ Resolve Grievance
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DIALOG 3: Escalate to BDO */}
      <AnimatePresence>
        {escalateModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center border border-rose-200">
                <ShieldAlert className="w-6 h-6 text-rose-600" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-black text-slate-800 dark:text-slate-100 text-base uppercase">
                  Escalate Grievance
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 font-extrabold leading-normal px-2">
                  {getEscalateConfirmText()}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setEscalateModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-xs uppercase transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEscalateConfirm}
                  className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs uppercase transition-colors shadow-md"
                >
                  Yes, Escalate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── GeoCamera Overlay modal ── */}
      {showGeoCamera && (
        <div className="fixed inset-0 z-[200] max-w-md mx-auto bg-black">
          <GeoCamera 
            onCapture={(photoData) => {
              setResolutionPhoto(photoData.imageUrl);
              setResolutionLat(photoData.lat);
              setResolutionLng(photoData.lng);
              setResolutionAddress(photoData.address || 'Velachery, Chennai');
              setShowGeoCamera(false);
              setResolveStep(3); // Advance to step 3 on capture
              toast.success("Resolution proof photo captured!");
            }} 
            onClose={() => setShowGeoCamera(false)} 
            userName={localStorage.getItem('jn_name') || 'WARD OFFICER'}
            userWard={`Ward ${localStorage.getItem('jn_ward') || '142'}`}
          />
        </div>
      )}

    </motion.div>
  );
}
