import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Send, Camera, AlertCircle, HelpCircle } from 'lucide-react';
import CategoryIcon from '../../shared/components/CategoryIcon';

export default function RaiseIssue() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [selectedWards, setSelectedWards] = useState([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('Normal');
  const [photo, setPhoto] = useState('');
  const [recipient, setRecipient] = useState('bdo');

  const constituencyWards = ['140', '141', '142', '143', '144', '145', '146', '147'];
  const categoryKeys = ['roads', 'water', 'electricity', 'health', 'education', 'agriculture', 'revenue', 'welfare'];

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhoto(reader.result);
        toast.success('Document uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleWardToggle = (ward) => {
    if (selectedWards.includes(ward)) {
      setSelectedWards(selectedWards.filter(w => w !== ward));
    } else {
      setSelectedWards([...selectedWards, ward]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Issue Title is required');
      return;
    }

    if (selectedWards.length === 0) {
      toast.error('Please select at least one affected ward');
      return;
    }

    if (!category) {
      toast.error('Please select an issue category');
      return;
    }

    if (!description.trim() || description.length < 15) {
      toast.error('Please provide a detailed description (min 15 chars)');
      return;
    }

    const issueId = 'LA-ISS-' + Math.floor(1000 + Math.random() * 9000).toString();
    const newIssue = {
      id: issueId,
      title,
      affected_wards: selectedWards,
      category,
      description,
      urgency,
      recipient,
      photo,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    // Save constituency issues to localStorage
    const list = JSON.parse(localStorage.getItem('jn_constituency_issues') || '[]');
    list.push(newIssue);
    localStorage.setItem('jn_constituency_issues', JSON.stringify(list));

    // Success toast showing routing target in the active language
    const recipientNames = {
      ward_officer: 'Ward Officer',
      bdo: 'BDO',
      collector: 'District Collector',
      dept_secretary: 'Department Secretary'
    };

    const targetName = recipientNames[recipient] || recipient.toUpperCase();

    const isTamil = t('app_name') === 'ஜனநாயகம்';
    const successMsg = isTamil
      ? `பிரச்சினை ${targetName}-க்கு அனுப்பப்பட்டது. ID: #${issueId}`
      : `Constituency issue raised and routed to ${targetName}. ID: #${issueId}`;

    toast.success(successMsg);
    navigate('/mla');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-2 bg-[#1B5E20]/5 rounded-xl border border-[#1B5E20]/15 text-[#1B5E20]">
          <AlertCircle className="w-5 h-5" />
        </div>
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
          {t('raise_issue')}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            1. Issue / Program Title
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Velachery Main Canal Desilting & Widening works"
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-colors placeholder-slate-400"
          />
        </div>

        {/* Affected Wards Checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            2. {t('affected_wards')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {constituencyWards.map(wardNum => {
              const isChecked = selectedWards.includes(wardNum);
              return (
                <button
                  key={wardNum}
                  type="button"
                  onClick={() => handleWardToggle(wardNum)}
                  className={`py-2 px-3 border rounded-xl font-bold text-xs transition-colors text-center ${
                    isChecked
                      ? 'bg-[#1B5E20] border-[#1B5E20] text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Ward {wardNum}
                </button>
              );
            })}
          </div>
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
                      ? 'bg-[#1B5E20]/10 border-2 border-[#1B5E20] text-[#1B5E20] dark:bg-emerald-950/20 dark:border-emerald-500 font-extrabold shadow-sm'
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
        <div className="space-y-2">
          <div className="flex justify-between items-center pl-1">
            <label className="text-xs font-black text-slate-600 uppercase tracking-widest block">
              4. Issue Summary & Action Requirements
            </label>
            <span className="text-[10px] font-mono text-slate-400 font-bold">
              {description.length}/1000
            </span>
          </div>
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Outline the policy level issue, resource requests, or constituency level project needs..."
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 text-sm shadow-sm transition-colors resize-none placeholder-slate-400"
          ></textarea>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            5. Urgency Classification
          </label>
          <div className="flex gap-4 pl-1">
            {['Normal', 'Urgent', 'Emergency'].map(level => (
              <label key={level} className="flex items-center gap-2 text-xs font-extrabold cursor-pointer text-slate-700 dark:text-slate-350">
                <input
                  type="radio"
                  name="urgency"
                  value={level}
                  checked={urgency === level}
                  onChange={() => setUrgency(level)}
                  className="w-4 h-4 text-[#1B5E20] border-slate-300 focus:ring-[#1B5E20]"
                />
                <span>{level}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Document attachment */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            6. Supporting Document / Photo
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 shadow-sm rounded-xl px-4 py-3 text-slate-700 font-bold text-xs cursor-pointer">
              <Camera className="w-4 h-4 text-[#1B5E20]" />
              <span>Upload Document</span>
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

        {/* Route Target Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-600 uppercase tracking-widest pl-1 block">
            7. Dispatch and Route to
          </label>
          <select
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#1B5E20] outline-none px-4 py-3.5 rounded-2xl text-slate-800 dark:text-slate-100 font-bold text-sm shadow-sm transition-all cursor-pointer hover:border-slate-300"
          >
            <option value="ward_officer">Ward Officer (Local Actions)</option>
            <option value="bdo">Block Development Officer (BDO)</option>
            <option value="collector">District Collector (IAS)</option>
            <option value="dept_secretary">Department Secretary (IAS State Secretariat)</option>
          </select>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] hover:from-[#003366] hover:to-[#004d99] text-white font-extrabold text-base py-4 rounded-2xl shadow-[0_8px_20px_rgba(27,94,32,0.15)] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Dispatch Constituency Issue</span>
          <Send className="w-4.5 h-4.5" />
        </button>

      </form>
    </motion.div>
  );
}
