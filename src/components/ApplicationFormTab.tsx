import React, { useState } from 'react';
import { CollegeApplicationData, ActivityItem, HonorItem } from '../types';
import { FileUp, Sparkles, Plus, Trash2, BookOpen, GraduationCap, Building2, User, Award, FileText, CheckCircle } from 'lucide-react';

interface ApplicationFormTabProps {
  appData: CollegeApplicationData;
  setAppData: React.Dispatch<React.SetStateAction<CollegeApplicationData>>;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
  onLoadSample: (sampleId: string) => void;
  onClearForm?: () => void;
}

export const ApplicationFormTab: React.FC<ApplicationFormTabProps> = ({
  appData,
  setAppData,
  onRunAnalysis,
  isAnalyzing,
  onLoadSample,
  onClearForm,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'essays' | 'activities' | 'import'>('profile');
  const [importText, setImportText] = useState('');
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Field change handlers
  const handleChange = (field: keyof CollegeApplicationData, value: any) => {
    setAppData((prev) => ({ ...prev, [field]: value }));
  };

  // Activity handlers
  const handleAddActivity = () => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: '',
      organization: '',
      role: '',
      grades: ['11', '12'],
      hoursPerWeek: 0,
      weeksPerYear: 0,
      description: '',
    };
    setAppData((prev) => ({ ...prev, activities: [...prev.activities, newAct] }));
  };

  const handleUpdateActivity = (index: number, field: keyof ActivityItem, value: any) => {
    setAppData((prev) => {
      const updated = [...prev.activities];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, activities: updated };
    });
  };

  const handleRemoveActivity = (index: number) => {
    setAppData((prev) => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  // Honors handlers
  const handleAddHonor = () => {
    const newHon: HonorItem = {
      id: `hon-${Date.now()}`,
      title: '',
      gradeLevel: '11th Grade',
      levelOfRecognition: 'National',
    };
    setAppData((prev) => ({ ...prev, honors: [...prev.honors, newHon] }));
  };

  const handleUpdateHonor = (index: number, field: keyof HonorItem, value: any) => {
    setAppData((prev) => {
      const updated = [...prev.honors];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, honors: updated };
    });
  };

  const handleRemoveHonor = (index: number) => {
    setAppData((prev) => ({
      ...prev,
      honors: prev.honors.filter((_, i) => i !== index),
    }));
  };

  // Handle Document Upload Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    setImportSuccess(false);

    try {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result as string;
          const res = await fetch('/api/extract-app-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageBase64: base64, mimeType: file.type }),
          });
          const result = await res.json();
          if (result.success && result.data) {
            mergeExtractedData(result.data);
          }
          setIsParsingDoc(false);
        };
        reader.readAsDataURL(file);
      } else {
        const text = await file.text();
        const res = await fetch('/api/extract-app-data', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ textContent: text }),
        });
        const result = await res.json();
        if (result.success && result.data) {
          mergeExtractedData(result.data);
        }
        setIsParsingDoc(false);
      }
    } catch (err) {
      console.error(err);
      setIsParsingDoc(false);
    }
  };

  const handleParseRawText = async () => {
    if (!importText.trim()) return;
    setIsParsingDoc(true);
    setImportSuccess(false);
    try {
      const res = await fetch('/api/extract-app-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textContent: importText }),
      });
      const result = await res.json();
      if (result.success && result.data) {
        mergeExtractedData(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsParsingDoc(false);
    }
  };

  const mergeExtractedData = (data: Partial<CollegeApplicationData>) => {
    setAppData((prev) => ({
      ...prev,
      applicantName: data.applicantName || prev.applicantName,
      email: data.email || prev.email,
      highSchool: data.highSchool || prev.highSchool,
      gpa: data.gpa || prev.gpa,
      testScores: data.testScores || prev.testScores,
      intendedMajor: data.intendedMajor || prev.intendedMajor,
      targetColleges: data.targetColleges?.length ? data.targetColleges : prev.targetColleges,
      personalStatement: data.personalStatement || prev.personalStatement,
      activities: data.activities?.length ? data.activities : prev.activities,
      honors: data.honors?.length ? data.honors : prev.honors,
    }));
    setImportSuccess(true);
    setTimeout(() => setImportSuccess(false), 4000);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Quick Actions - Editorial Aesthetic */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 border border-[#1A1A1A] shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center space-x-2 px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-bold bg-white text-[#1A1A1A] mb-3">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Step 1 of 4 • General Information</span>
            </span>
            <h2 className="text-3xl font-serif font-light tracking-tight text-white">Student Application Portfolio</h2>
            <p className="text-xs text-white/70 mt-1 max-w-2xl font-serif italic">
              Formulate your academic profile, essay drafts, and extracurricular activities or upload an existing resume draft for AI extraction.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {onClearForm && (
              <button
                onClick={onClearForm}
                className="px-4 py-2 bg-[#2A2A2A] hover:bg-rose-700 text-white border border-white/20 text-[10px] uppercase tracking-widest font-bold transition-all"
                title="Clear all fields to start with a blank form"
              >
                Clear Form
              </button>
            )}
            <button
              onClick={() => onLoadSample('stanford-cs')}
              className="px-4 py-2 bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white border border-white/20 text-[10px] uppercase tracking-widest font-bold transition-all"
            >
              Load Sample App
            </button>
            <button
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="px-5 py-2.5 bg-white hover:bg-[#F9F7F2] text-[#1A1A1A] border border-white font-bold text-[11px] uppercase tracking-[0.18em] transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{isAnalyzing ? 'Evaluating Application...' : 'Analyze & Get AI Feedback'}</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex flex-wrap gap-2 mt-8 border-t border-white/20 pt-4">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center space-x-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
              activeSubTab === 'profile'
                ? 'bg-white text-[#1A1A1A]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Profile & Academics</span>
          </button>

          <button
            onClick={() => setActiveSubTab('essays')}
            className={`flex items-center space-x-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
              activeSubTab === 'essays'
                ? 'bg-white text-[#1A1A1A]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Essays & Manuscripts</span>
          </button>

          <button
            onClick={() => setActiveSubTab('activities')}
            className={`flex items-center space-x-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
              activeSubTab === 'activities'
                ? 'bg-white text-[#1A1A1A]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Extracurriculars ({appData.activities.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('import')}
            className={`flex items-center space-x-2 px-4 py-2 text-[10px] uppercase tracking-widest font-bold transition-all ${
              activeSubTab === 'import'
                ? 'bg-white text-[#1A1A1A]'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <FileUp className="w-3.5 h-3.5" />
            <span>Import / Upload Draft</span>
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Personal Profile */}
      {activeSubTab === 'profile' && (
        <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-6">
          <div className="border-b border-[#1A1A1A]/20 pb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Applicant Credentials</p>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Personal & Target University General Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Full Legal Name</label>
              <input
                type="text"
                value={appData.applicantName}
                onChange={(e) => handleChange('applicantName', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Email Address</label>
              <input
                type="email"
                value={appData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={appData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">High School Name</label>
              <input
                type="text"
                value={appData.highSchool}
                onChange={(e) => handleChange('highSchool', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">GPA (Unweighted / Weighted)</label>
              <input
                type="text"
                value={appData.gpa}
                onChange={(e) => handleChange('gpa', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">SAT / ACT Scores</label>
              <input
                type="text"
                value={appData.testScores}
                onChange={(e) => handleChange('testScores', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Intended Major / Field</label>
              <input
                type="text"
                value={appData.intendedMajor}
                onChange={(e) => handleChange('intendedMajor', e.target.value)}
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Target Universities (Comma separated)</label>
              <input
                type="text"
                value={appData.targetColleges.join(', ')}
                onChange={(e) =>
                  handleChange(
                    'targetColleges',
                    e.target.value.split(',').map((s) => s.trim())
                  )
                }
                className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 2: Application Essays */}
      {activeSubTab === 'essays' && (
        <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-6">
          <div className="border-b border-[#1A1A1A]/20 pb-3">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Manuscript Drafting Space</p>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Personal Statement & Supplemental Essays</h3>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80">Personal Statement Prompt</label>
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold">Common App Essay (650 Words Max)</span>
            </div>
            <input
              type="text"
              value={appData.personalStatementPrompt}
              onChange={(e) => handleChange('personalStatementPrompt', e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] mb-3"
            />

            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Personal Statement Essay Body</label>
            <textarea
              rows={12}
              value={appData.personalStatement}
              onChange={(e) => handleChange('personalStatement', e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-4 text-sm font-serif leading-relaxed text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              placeholder="Paste or write your main college application essay here..."
            />
            <div className="flex justify-between text-[10px] uppercase tracking-widest text-[#1A1A1A]/60 font-semibold mt-1">
              <span>Word Count: {appData.personalStatement.trim().split(/\s+/).filter(Boolean).length} words</span>
              <span>Target: 500 - 650 words</span>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1A1A1A]/20">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80">Supplemental Essay Prompt</label>
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold">College Specific Supplement</span>
            </div>
            <input
              type="text"
              value={appData.supplementalEssay1Prompt}
              onChange={(e) => handleChange('supplementalEssay1Prompt', e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] px-3.5 py-2 text-xs font-sans text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] mb-3"
            />

            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]/80 mb-1.5">Supplemental Essay Body</label>
            <textarea
              rows={5}
              value={appData.supplementalEssay1}
              onChange={(e) => handleChange('supplementalEssay1', e.target.value)}
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-4 text-sm font-serif leading-relaxed text-[#1A1A1A] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
              placeholder="Paste or write your supplemental essay prompt response here..."
            />
          </div>

        </div>
      )}

      {/* Sub-tab 3: Activities & Honors */}
      {activeSubTab === 'activities' && (
        <div className="space-y-6">
          
          {/* Activities List */}
          <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A1A1A]/20 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Extracurricular Record</p>
                <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Leadership & Activities Log</h3>
              </div>

              <button
                onClick={handleAddActivity}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>
            </div>

            <div className="space-y-4 pt-2">
              {appData.activities.map((act, idx) => (
                <div key={act.id} className="bg-[#F9F7F2] border border-[#1A1A1A] p-4 space-y-3 relative">
                  <button
                    onClick={() => handleRemoveActivity(idx)}
                    className="absolute top-3 right-3 text-[#1A1A1A]/60 hover:text-rose-600 transition-colors p-1"
                    title="Remove activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Position / Role</label>
                      <input
                        type="text"
                        value={act.role}
                        onChange={(e) => handleUpdateActivity(idx, 'role', e.target.value)}
                        className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Organization Name</label>
                      <input
                        type="text"
                        value={act.organization}
                        onChange={(e) => handleUpdateActivity(idx, 'organization', e.target.value)}
                        className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Hrs / Wk</label>
                        <input
                          type="number"
                          value={act.hoursPerWeek}
                          onChange={(e) => handleUpdateActivity(idx, 'hoursPerWeek', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Wks / Yr</label>
                        <input
                          type="number"
                          value={act.weeksPerYear}
                          onChange={(e) => handleUpdateActivity(idx, 'weeksPerYear', parseInt(e.target.value) || 0)}
                          className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70">Accomplishments & Metrics (150 Char Max)</label>
                      <span className="text-[9px] text-[#1A1A1A]/50 font-semibold">{act.description.length} / 150</span>
                    </div>
                    <textarea
                      rows={2}
                      maxLength={150}
                      value={act.description}
                      onChange={(e) => handleUpdateActivity(idx, 'description', e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] p-2.5 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Honors List */}
          <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Academic Distinctions</p>
                <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Honors & Awards</h3>
              </div>

              <button
                onClick={handleAddHonor}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Honor</span>
              </button>
            </div>

            <div className="space-y-3 pt-2">
              {appData.honors.map((hon, idx) => (
                <div key={hon.id} className="bg-[#F9F7F2] border border-[#1A1A1A] p-3 grid grid-cols-1 sm:grid-cols-3 gap-3 relative items-center">
                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Honor Title</label>
                    <input
                      type="text"
                      value={hon.title}
                      onChange={(e) => handleUpdateHonor(idx, 'title', e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Grade Level</label>
                    <input
                      type="text"
                      value={hon.gradeLevel}
                      onChange={(e) => handleUpdateHonor(idx, 'gradeLevel', e.target.value)}
                      className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex-1">
                      <label className="block text-[9px] uppercase tracking-widest font-bold text-[#1A1A1A]/70 mb-1">Recognition Level</label>
                      <select
                        value={hon.levelOfRecognition}
                        onChange={(e) => handleUpdateHonor(idx, 'levelOfRecognition', e.target.value as any)}
                        className="w-full bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none"
                      >
                        <option value="School">School</option>
                        <option value="State/Regional">State/Regional</option>
                        <option value="National">National</option>
                        <option value="International">International</option>
                      </select>
                    </div>

                    <button
                      onClick={() => handleRemoveHonor(idx)}
                      className="text-[#1A1A1A]/60 hover:text-rose-600 transition-colors p-1 mt-4"
                      title="Remove honor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Sub-tab 4: Import Document / Raw Text */}
      {activeSubTab === 'import' && (
        <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-6">
          <div className="border-b border-[#1A1A1A]/20 pb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Document Ingestion</p>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Import Application Draft or Resume</h3>
            <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-1">
              Upload a PDF screenshot or paste raw draft text. Gemini will parse and structure the fields automatically into your application profile.
            </p>
          </div>

          {importSuccess && (
            <div className="p-3 bg-[#F2EDE4] border border-[#1A1A1A] text-[#1A1A1A] text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>Document successfully parsed! Review updated fields in your application tabs.</span>
            </div>
          )}

          <div className="border-2 border-dashed border-[#1A1A1A] bg-[#F9F7F2] hover:bg-[#F2EDE4] p-8 text-center transition-all">
            <input
              type="file"
              accept="image/*,.pdf,.txt,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload-input"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center">
              <FileUp className="w-10 h-10 text-[#1A1A1A] mb-3" />
              <span className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">Click to upload application draft or screenshot</span>
              <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 mt-1 font-semibold">Supports PNG, JPG, PDF, TXT files</span>
            </label>
          </div>

          <div className="pt-2">
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1.5">Or Paste Raw Application / Resume Draft</label>
            <textarea
              rows={6}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              placeholder="Paste raw application draft, Common App section, or student bio text here..."
              className="w-full bg-[#F9F7F2] border border-[#1A1A1A] p-4 text-xs font-mono text-[#1A1A1A] focus:outline-none focus:bg-white"
            />
            <button
              onClick={handleParseRawText}
              disabled={isParsingDoc || !importText.trim()}
              className="mt-4 px-5 py-2.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-[0.2em] font-bold flex items-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{isParsingDoc ? 'Parsing Document...' : 'AI Auto-Extract Application Fields'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
