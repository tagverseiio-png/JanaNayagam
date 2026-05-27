import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Camera, MapPin, Send, AlertCircle, Info } from 'lucide-react';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function RaiseOnBehalf() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [citizenId, setCitizenId] = useState('');
  const [citizenName, setCitizenName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photo, setPhoto] = useState('');
  const [location, setLocation] = useState(null);
  const [locationCapturing, setLocationCapturing] = useState(false);
  const [locationCaptured, setLocationCaptured] = useState(false);
  const [manualLocation, setManualLocation] = useState('');

  const ward = '142'; // Pre-filled ward
  const categoryKeys = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        toast.success('Photo attached');
      };
      reader.readAsDataURL(file);
    }
  };

  const captureLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by browser');
      return;
    }
    setLocationCapturing(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) });
        setLocationCaptured(true);
        setLocationCapturing(false);
        toast.success('GPS coordinates locked');
      },
      (err) => {
        setLocationCapturing(false);
        toast.error('Failed to lock location: ' + err.message);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ID validation (12-digit Aadhaar or 10-character Alphanumeric Voter ID)
    const rawId = citizenId.replace(/\s/g, '');
    const isAadhaar = /^\d{12}$/.test(rawId);
    const isVoter = /^[a-zA-Z]{3}\d{7}$/.test(rawId) || /^[a-zA-Z0-9]{10}$/.test(rawId);

    if (!isAadhaar && !isVoter) {
      toast.error('Invalid ID format. Must be a 12-digit Aadhaar or 10-char Alphanumeric Voter ID.');
      return;
    }

    if (!citizenName.trim()) {
      toast.error('Citizen name is required');
      return;
    }

    if (!category) {
      toast.error('Please select a category');
      return;
    }

    if (!description.trim() || description.length < 10) {
      toast.error('Detailed description is required (min 10 chars)');
      return;
    }

    const ticketId = Math.floor(1000 + Math.random() * 9000).toString();
    const finalLocation = location || (manualLocation.trim() ? { manual: manualLocation } : null);

    const newTicket = {
      id: ticketId,
      category,
      description,
      status: 'open',
      priority: 'medium',
      created_at: new Date().toISOString(),
      sla_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      ward,
      citizen_name: citizenName,
      raised_by: 'VAO',
      citizen_id: rawId,
      photo,
      location: finalLocation
    };

    // Save to localStorage
    const list = JSON.parse(localStorage.getItem('jn_tickets') || '[]');
    list.push(newTicket);
    localStorage.setItem('jn_tickets', JSON.stringify(list));

    const isTamil = t('app_name') === 'ஜனநாயகம்';
    const successMsg = isTamil
      ? `குடிமகன் சார்பாக புகார் சமர்ப்பிக்கப்பட்டது. புகார் எண்: #${ticketId}`
      : `Complaint submitted on behalf of citizen. Ticket ID: #${ticketId}`;

    toast.success(successMsg);
    navigate('/vao/tickets');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#9a0002]/5 rounded-xl border border-[#9a0002]/10 text-[#9a0002]">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {t('vao_raise_title')}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        
        {/* Citizen ID */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            1. Citizen Aadhaar or Voter ID
          </label>
          <input
            type="text"
            required
            value={citizenId}
            onChange={(e) => setCitizenId(e.target.value)}
            placeholder="e.g. 12-digit Aadhaar or 10-char Voter ID (ABC1234567)"
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm shadow-sm transition-colors placeholder-slate-400"
          />
        </div>

        {/* Citizen Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            2. Citizen Full Name
          </label>
          <input
            type="text"
            required
            value={citizenName}
            onChange={(e) => setCitizenName(e.target.value)}
            placeholder="Enter citizen's official name"
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm shadow-sm transition-colors placeholder-slate-400"
          />
        </div>

        {/* Category selector grid */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            3. Select Issue Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoryKeys.map((key) => {
              const isSelected = category === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setCategory(key)}
                  className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-[#003366]/10 border-2 border-[#003366] text-[#003366] dark:bg-blue-950/20 dark:border-blue-500 dark:text-blue-400 font-extrabold shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                  }`}
                >
                  <CategoryIcon category={key} />
                  <span className="text-[10px] font-bold tracking-wide uppercase">
                    {t(`categories.${key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            4. Detailed Description
          </label>
          <textarea
            required
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the complaint in detail on behalf of the citizen..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm shadow-sm transition-colors resize-none placeholder-slate-400"
          ></textarea>
        </div>

        {/* Photo Proof */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            5. Attach Proof Photo (Optional)
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-xl px-4 py-3 text-slate-700 font-bold text-xs cursor-pointer transition-colors">
              <Camera className="w-4 h-4 text-[#9a0002]" />
              <span>Attach Image</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>

            {photo && (
              <div className="w-12 h-12 rounded-xl border border-slate-200 overflow-hidden shadow-sm relative">
                <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setPhoto('')}
                  className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white text-[8px] font-black uppercase"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Location GPS or Manual */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            6. Location (GPS Geotag or Description)
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={captureLocation}
              disabled={locationCapturing}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold text-xs border shadow-sm transition-colors ${
                locationCaptured
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#9a0002]" />
              <span>
                {locationCapturing ? 'Locking...' : locationCaptured ? 'GPS Coordinates Locked ✓' : 'Lock Live GPS'}
              </span>
            </button>

            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              disabled={locationCaptured}
              placeholder="Or enter landmark/location details manually..."
              className="w-full bg-slate-50 disabled:opacity-60 border border-slate-200 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600] outline-none px-4 py-3 rounded-xl text-slate-800 dark:text-slate-100 text-xs shadow-sm transition-colors placeholder-slate-400"
            />
          </div>
        </div>

        {/* Note */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/65 flex items-start gap-2.5 shadow-inner">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] sm:text-xs text-amber-800 font-bold leading-normal">
            {t('vao_note')}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#003366] to-[#004d99] hover:from-[#FF6600] hover:to-[#ff802b] text-white font-extrabold text-base py-4 rounded-2xl shadow-[0_8px_20px_rgba(0,51,102,0.1)] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Submit On Behalf</span>
          <Send className="w-4.5 h-4.5" />
        </button>

      </form>
    </motion.div>
  );
}
