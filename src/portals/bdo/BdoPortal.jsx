import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { 
  BarChart2, FileText, TrendingUp, ArrowUpRight, Shield, MapPin, Plus, Trash2, Camera, 
  AlertTriangle, CheckCircle, ChevronRight, Layers, Users, Map
} from 'lucide-react';

import PortalLayout from '../../shared/components/PortalLayout';
import ErrorBoundary from '../../shared/components/ErrorBoundary';
import TnMap from '../../shared/components/TnMap';
import GeoCamera from '../../shared/components/GeoCamera';

// Subcomponent: BdoDashboard
function BdoDashboard({ bdoNotes, handleSaveNote, handleDeleteNote, setShowGeoCamera, noteTitle, setNoteTitle, noteText, setNoteText, notePhoto }) {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {/* Left side: Overview card + Form Note */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-6 shadow-sm select-none">
          <span className="text-[10px] font-black bg-red-50 dark:bg-[#9a0002]/20 text-[#8B1A1A] dark:text-rose-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Block Development Officer
          </span>
          <h2 className="text-xl font-black text-slate-850 dark:text-slate-100 mt-3">
            {tLabel("Welcome, BDO", "வரவேற்கிறோம், பி.டி.ஓ")}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Velachery Taluk Division · Rural Development
          </p>
        </div>

        {/* Add Field Note Form */}
        <div className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-[#8B1A1A] select-none">
            <Layers className="w-5 h-5" />
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              {tLabel("Add Field Observation Note", "கள ஆய்வு குறிப்பு சேர்க்க")}
            </h3>
          </div>

          <form onSubmit={handleSaveNote} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 block">
                Subject / Location
              </label>
              <input
                type="text"
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. RS Puram Lake Desilting Inspection"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 block">
                Inspection Findings
              </label>
              <textarea
                required
                rows={3}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Provide specific notes from inspection..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-[#8B1A1A] outline-none px-4 py-2.5 rounded-xl text-slate-850 dark:text-slate-100 text-xs shadow-sm resize-none leading-relaxed font-bold"
              ></textarea>
            </div>

            {/* Add Optional Geo Photo */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 block">
                Evidence Geo Photo (Optional)
              </label>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowGeoCamera(true)}
                  className="bg-white dark:bg-slate-800 border border-[#8B1A1A]/30 text-[#8B1A1A] hover:bg-red-50 rounded-xl px-4 py-2.5 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Camera className="w-4 h-4" />
                  <span>{tLabel("📷 Add Geo Photo", "📷 படம் சேர்")}</span>
                </button>

                {notePhoto && (
                  <div className="relative w-12 h-12 rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <img src={notePhoto} alt="BDO Note stamp preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              style={{ backgroundColor: '#8B1A1A' }}
              className="w-full py-3 rounded-xl hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-md cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>{tLabel("Save Field Note", "குறிப்பைச் சேமி")}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right side: List of BDO Notes */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider pl-1 select-none">
          {tLabel("Field Observations Log", "கள ஆய்வு குறிப்புகள் பதிவேடு")}
        </h3>

        {bdoNotes.map((note) => (
          <div
            key={note.id}
            className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3.5 relative"
          >
            <button
              onClick={() => handleDeleteNote(note.id)}
              className="absolute top-4 right-4 text-slate-450 hover:text-red-600 transition-colors p-1"
              title="Delete observation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 block uppercase tracking-wider">
                {new Date(note.created_at).toLocaleDateString()} · {new Date(note.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <h4 className="font-black text-sm text-slate-800 dark:text-slate-100 pr-6">
                {note.title}
              </h4>
            </div>

            <p className="text-xs text-slate-650 dark:text-slate-400 leading-relaxed font-bold">
              {note.text}
            </p>

            {note.photo && (
              <div className="w-full aspect-video rounded-xl border border-slate-200 overflow-hidden bg-slate-950 shadow-sm relative">
                <img src={note.photo} alt="BDO Field proof" className="w-full h-full object-cover" />
                {note.lat && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                    <MapPin className="w-2.5 h-2.5" />
                    <span>{note.lat}°N, {note.lng}°E</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent: BdoTickets (Ward performance)
function BdoTickets() {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const wards = [
    { name: '140', taluk: 'Velachery', officer: 'Suresh M.', open: 5, breach: true },
    { name: '141', taluk: 'Velachery', officer: 'Anitha K.', open: 1, breach: false },
    { name: '142', taluk: 'Velachery', officer: 'Karthik Raj S.', open: 8, breach: true },
    { name: '143', taluk: 'Velachery', officer: 'Ramya V.', open: 2, breach: false }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4 select-none">
      <div className="pb-2">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {tLabel("Ward Performance Dashboard", "வார்டு செயல்பாட்டு விபரம்")}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest">
          Taluk divisions statistics and SLA warnings
        </p>
      </div>

      {/* Desktop View Table */}
      <div className="hidden md:block overflow-x-auto rounded-2xl border">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3.5">Ward Name</th>
              <th className="px-5 py-3.5">Assigned Officer</th>
              <th className="px-5 py-3.5">Open Complaints</th>
              <th className="px-5 py-3.5">SLA SLA Breach status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-855 text-xs font-bold text-slate-700 dark:text-slate-300">
            {wards.map(w => (
              <tr key={w.name} className="hover:bg-slate-50/50">
                <td className="px-5 py-4 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#8B1A1A]" />
                  <span>Ward {w.name}</span>
                </td>
                <td className="px-5 py-4">{w.officer}</td>
                <td className="px-5 py-4 text-rose-600 font-mono">{w.open} active</td>
                <td className="px-5 py-4">
                  {w.breach ? (
                    <span className="text-[10px] bg-red-100 text-red-750 px-2 py-0.5 rounded-full uppercase font-black">
                      Breach Warning
                    </span>
                  ) : (
                    <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase font-black">
                      SLA Clean
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View Ward Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {wards.map(w => (
          <div 
            key={w.name}
            className="bg-slate-50 dark:bg-slate-850/40 border border-[#DDE1E7] dark:border-slate-800 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8B1A1A]" />
                <span className="font-extrabold text-slate-800 dark:text-slate-100">Ward {w.name}</span>
              </div>
              {w.breach && (
                <span className="text-[10px] bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full uppercase font-black">
                  Breach
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800 text-[11px] text-slate-500 font-bold">
              <div>
                <span>Officer:</span>
                <p className="font-black text-slate-700 dark:text-slate-300 mt-0.5">{w.officer}</p>
              </div>
              <div className="text-right">
                <span>Grievances:</span>
                <p className="font-black text-rose-600 mt-0.5">{w.open} Active</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcomponent: BdoAnalytics
function BdoAnalytics() {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
      <div className="pb-2">
        <h3 className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {tLabel("Grievance Category Insights", "பகுப்பாய்வு அறிக்கை")}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 uppercase tracking-widest">
          Scroll horizontally on mobile to review all analytical graphs
        </p>
      </div>

      {/* Horizontal Scroll Chart Container */}
      <div className="overflow-x-auto -webkit-overflow-scrolling-touch hide-scrollbar border border-slate-100 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950/20">
        <div className="min-w-[500px] h-60 relative flex items-end justify-around pb-6 pt-4 px-4">
          {/* Mock premium animated bar chart */}
          {[
            { cat: 'Roads', count: 12, pct: '60%' },
            { cat: 'Water', count: 18, pct: '90%' },
            { cat: 'Electricity', count: 8, pct: '40%' },
            { cat: 'Sanitation', count: 15, pct: '75%' },
            { cat: 'Revenue', count: 5, pct: '25%' }
          ].map((bar, idx) => (
            <div key={idx} className="flex flex-col items-center gap-3 w-16 relative group">
              <span className="text-[10px] font-black text-[#8B1A1A] mb-1 opacity-0 group-hover:opacity-100 transition-opacity absolute -top-4 bg-white dark:bg-slate-850 px-2 py-0.5 rounded border border-[#DDE1E7] dark:border-slate-750 shadow-sm z-10">
                {bar.count}
              </span>
              <div 
                style={{ height: bar.pct }} 
                className="w-8 bg-gradient-to-t from-[#8B1A1A] to-rose-500 rounded-t-lg shadow-md transition-all duration-500 hover:brightness-110 cursor-pointer"
              />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {bar.cat}
              </span>
            </div>
          ))}

          {/* Grid lines */}
          <div className="absolute inset-x-0 bottom-6 border-b border-slate-200 dark:border-slate-800" />
        </div>
      </div>
    </div>
  );
}

// Subcomponent: BdoEscalate (Escalate BDO to Collector)
function BdoEscalate() {
  const { i18n } = useTranslation();
  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success(tLabel("Grievance Escalation report dispatched to District Collector!", "வருவாய் அறிக்கை மாவட்ட ஆட்சியருக்கு அனுப்பப்பட்டது!"));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#DDE1E7] dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-lg mx-auto space-y-4 select-none">
      <div className="flex items-center gap-2 text-[#8B1A1A] pb-2 border-b border-slate-100 dark:border-slate-800">
        <ArrowUpRight className="w-5 h-5" />
        <h3 className="font-extrabold text-sm text-slate-850 dark:text-slate-100 uppercase tracking-wide">
          {tLabel("Escalate to Collector", "மாவட்ட ஆட்சியருக்கு மேல்முறையீடு")}
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
            Escalation Title
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Critical drainage bottleneck in Velachery Sector 2"
            className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 outline-none px-4 py-3 rounded-xl text-xs font-bold focus:border-[#8B1A1A]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 block">
            Justification & Case Details
          </label>
          <textarea
            required
            rows={4}
            placeholder="Outline why this requires collector-level intervention..."
            className="w-full bg-slate-50 dark:bg-slate-855 border border-slate-200 dark:border-slate-700 outline-none px-4 py-3 rounded-xl text-xs font-bold focus:border-[#8B1A1A]"
          />
        </div>

        <button
          type="submit"
          style={{ backgroundColor: '#8B1A1A' }}
          className="w-full py-3.5 rounded-xl hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition-colors cursor-pointer"
        >
          Dispatch Escalation
        </button>
      </form>
    </div>
  );
}

export default function BdoPortal() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const isTa = i18n.language === 'ta';
  const tLabel = (en, ta) => isTa ? ta : en;

  const [bdoNotes, setBdoNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteText, setNoteText] = useState('');
  const [notePhoto, setNotePhoto] = useState('');
  const [noteLat, setNoteLat] = useState('');
  const [noteLng, setNoteLng] = useState('');
  const [showGeoCamera, setShowGeoCamera] = useState(false);

  const loadBdoNotes = () => {
    const list = JSON.parse(localStorage.getItem('jn_bdo_notes') || '[]');
    if (list.length === 0) {
      const mockNotes = [
        {
          id: 'note-1',
          title: "Velachery Canal Bund Desilting",
          text: "Inspected the local storm water canal bund desilting work in Sector 3. Desilting completed for 450 meters. Flow capacity is upgraded to handle heavy monsoons.",
          photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
          lat: "12.9792",
          lng: "80.2223",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }
      ];
      localStorage.setItem('jn_bdo_notes', JSON.stringify(mockNotes));
      setBdoNotes(mockNotes);
    } else {
      setBdoNotes(list);
    }
  };

  useEffect(() => {
    loadBdoNotes();
  }, []);

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      toast.error(tLabel("Please enter note title.", "தயவுசெய்து குறிப்பு தலைப்பை உள்ளிடவும்."));
      return;
    }
    if (!noteText.trim()) {
      toast.error(tLabel("Please enter inspection notes.", "தயவுசெய்து ஆய்வு குறிப்புகளை உள்ளிடவும்."));
      return;
    }

    const newNote = {
      id: 'note-' + Date.now(),
      title: noteTitle.trim(),
      text: noteText.trim(),
      photo: notePhoto,
      lat: noteLat,
      lng: noteLng,
      created_at: new Date().toISOString()
    };

    const updated = [newNote, ...bdoNotes];
    localStorage.setItem('jn_bdo_notes', JSON.stringify(updated));
    setBdoNotes(updated);

    // Clear form
    setNoteTitle('');
    setNoteText('');
    setNotePhoto('');
    setNoteLat('');
    setNoteLng('');
    toast.success(tLabel("Inspection field note saved successfully!", "ஆய்வு களக் குறிப்பு வெற்றிகரமாக சேமிக்கப்பட்டது!"));
  };

  const handleDeleteNote = (noteId) => {
    const updated = bdoNotes.filter(n => n.id !== noteId);
    localStorage.setItem('jn_bdo_notes', JSON.stringify(updated));
    setBdoNotes(updated);
    toast.info(tLabel("Field note deleted.", "களக் குறிப்பு நீக்கப்பட்டது."));
  };

  const handleCameraCapture = (photoData) => {
    setNotePhoto(photoData.imageUrl);
    setNoteLat(photoData.lat.toString());
    setNoteLng(photoData.lng.toString());
    setShowGeoCamera(false);
    toast.success(tLabel("Inspection photo geo-stamped!", "ஆய்வுப் படம் வெற்றிகரமாக இணைக்கப்பட்டது!"));
  };

  const sidebarLinks = [
    {
      label: tLabel('Summary & Notes', 'முகப்பு & குறிப்புகள்'),
      path: '/bdo',
      icon: <Layers />
    },
    {
      label: tLabel('Wards Performance', 'வார்டு செயல்பாடுகள்'),
      path: '/bdo/tickets',
      icon: <FileText />
    },
    {
      label: tLabel('Analytics', 'விவரம்'),
      path: '/bdo/analytics',
      icon: <TrendingUp />
    },
    {
      label: tLabel('Escalate', 'மேல்முறையீடு'),
      path: '/bdo/escalate',
      icon: <ArrowUpRight />
    }
  ];

  return (
    <PortalLayout sidebarLinks={sidebarLinks} roleLabel="Block Development Officer (BDO)">
      {showGeoCamera && (
        <div className="fixed inset-0 z-[200] max-w-md mx-auto bg-black">
          <GeoCamera 
            onCapture={handleCameraCapture}
            onClose={() => setShowGeoCamera(false)}
            userName="BDO VELACHERY"
            userWard="Velachery Block"
          />
        </div>
      )}

      <Routes>
        <Route 
          path="/" 
          element={
            <BdoDashboard 
              bdoNotes={bdoNotes}
              handleSaveNote={handleSaveNote}
              handleDeleteNote={handleDeleteNote}
              setShowGeoCamera={setShowGeoCamera}
              noteTitle={noteTitle}
              setNoteTitle={setNoteTitle}
              noteText={noteText}
              setNoteText={setNoteText}
              notePhoto={notePhoto}
            />
          } 
        />
        <Route path="/tickets" element={<BdoTickets />} />
        <Route path="/analytics" element={<BdoAnalytics />} />
        <Route path="/escalate" element={<BdoEscalate />} />
      </Routes>
    </PortalLayout>
  );
}
