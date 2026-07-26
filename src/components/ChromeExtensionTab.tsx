import React, { useState } from 'react';
import { 
  Download, 
  Chrome, 
  Zap, 
  Copy, 
  Check, 
  Code2, 
  Layers, 
  Sparkles, 
  FileText, 
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Monitor,
  Github
} from 'lucide-react';
import { CollegeApplicationData } from '../types';
import { getExtensionFiles, downloadExtensionZip } from '../utils/chromeExtensionGenerator';

interface ChromeExtensionTabProps {
  appData: CollegeApplicationData;
}

export const ChromeExtensionTab: React.FC<ChromeExtensionTabProps> = ({ appData }) => {
  const [activeCodeFile, setActiveCodeFile] = useState<'manifest' | 'content' | 'popupHtml' | 'popupJs' | 'background' | 'sampleResume' | 'sampleTranscript'>('manifest');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [simulatedPortal, setSimulatedPortal] = useState<'uc' | 'commonapp'>('uc');

  // Simulated Web Form state for interactive sandbox
  const [simulatedFields, setSimulatedFields] = useState({
    applicantName: '',
    email: '',
    phone: '',
    highSchool: '',
    gpa: '',
    testScores: '',
    intendedMajor: '',
    personalStatement: '',
    supplementalEssay1: '',
  });

  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  const [isExtensionPopupOpen, setIsExtensionPopupOpen] = useState(true);
  const [autofillSuccessMessage, setAutofillSuccessMessage] = useState<string | null>(null);

  const extensionFiles = getExtensionFiles();

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadExtensionZip(appData);
    } catch (err) {
      console.error(err);
      alert('Could not generate ZIP file. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSimulatedAutofill = () => {
    const isDossierEmpty = !appData.applicantName && !appData.email && !appData.highSchool && !appData.personalStatement;

    if (isDossierEmpty) {
      setAutofillSuccessMessage(`⚠️ Your Application Dossier is currently blank. Type your details into Step 1 or load a sample profile to test autofill!`);
      return;
    }

    // Highlight all fields and populate them progressively
    const fieldKeys: (keyof typeof simulatedFields)[] = [
      'applicantName',
      'email',
      'phone',
      'highSchool',
      'gpa',
      'testScores',
      'intendedMajor',
      'personalStatement',
      'supplementalEssay1',
    ];

    setHighlightedFields(fieldKeys);

    let filledCount = 0;
    fieldKeys.forEach((key, index) => {
      setTimeout(() => {
        const val = appData[key] || '';
        if (val) filledCount++;
        setSimulatedFields((prev) => ({
          ...prev,
          [key]: val,
        }));
        if (index === fieldKeys.length - 1) {
          const portalName = simulatedPortal === 'uc' ? 'UC Application' : 'Common App';
          setAutofillSuccessMessage(`⚡ Successfully autofilled ${filledCount || fieldKeys.length} ${portalName} fields from your Dossier!`);
          setTimeout(() => {
            setHighlightedFields([]);
          }, 3500);
        }
      }, index * 160);
    });
  };

  const handleClearSimulatedForm = () => {
    setSimulatedFields({
      applicantName: '',
      email: '',
      phone: '',
      highSchool: '',
      gpa: '',
      testScores: '',
      intendedMajor: '',
      personalStatement: '',
      supplementalEssay1: '',
    });
    setHighlightedFields([]);
    setAutofillSuccessMessage(null);
  };

  const getActiveCodeContent = () => {
    switch (activeCodeFile) {
      case 'manifest':
        return extensionFiles.manifest;
      case 'content':
        return extensionFiles.contentJs;
      case 'popupHtml':
        return extensionFiles.popupHtml;
      case 'popupJs':
        return extensionFiles.popupJs;
      case 'background':
        return extensionFiles.backgroundJs;
      case 'sampleResume':
        return extensionFiles.sampleResume;
      case 'sampleTranscript':
        return extensionFiles.sampleTranscript;
      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCodeContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Top Banner / Hero Header */}
      <div className="bg-[#1A1A1A] text-white p-6 sm:p-8 border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#10b981] relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center space-x-2 bg-[#10b981] text-black px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
              <Chrome className="w-3.5 h-3.5" />
              <span>Chrome Extension Manifest V3 · AI-Powered</span>
            </div>
          </div>

          <h2 className="font-serif italic text-3xl sm:text-4xl font-bold tracking-tight">
            UC App Autofill — Powered by Gemma 4
          </h2>

          <p className="text-sm text-gray-300 leading-relaxed font-sans">
            A standalone Chrome Extension purpose-built for the University of California application. Import a resume and transcript, review the extracted profile, then let Gemma 4 (with a built-in local mapper as a fallback) map your details onto the UC portal's visible fields — including UC-specific PIQs and activity sections.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="px-5 py-3 bg-[#10b981] hover:bg-[#059669] text-black font-bold text-xs uppercase tracking-wider flex items-center space-x-2 shadow-[2px_2px_0px_0px_#ffffff] transition-all"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Generating ZIP...' : 'Download Chrome Extension (.zip)'}</span>
            </button>

            <a
              href="#installation-guide"
              className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider border border-white/30 flex items-center space-x-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Setup Instructions</span>
            </a>
          </div>
        </div>
      </div>

      {/* SECTION 1: INTERACTIVE CHROME EXTENSION SIMULATOR */}
      <div className="bg-white border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        {/* Simulator Title Bar */}
        <div className="bg-[#F2EDE4] border-b border-[#1A1A1A] px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-[#1A1A1A]" />
            <h3 className="font-bold text-sm uppercase tracking-wider text-[#1A1A1A]">
              Interactive Extension Sandbox & Live Application Tester
            </h3>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            {/* Portal Switcher */}
            <div className="inline-flex border border-[#1A1A1A] bg-white p-0.5">
              <button
                onClick={() => {
                  setSimulatedPortal('uc');
                  handleClearSimulatedForm();
                }}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  simulatedPortal === 'uc'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                UC Application
              </button>
              <button
                onClick={() => {
                  setSimulatedPortal('commonapp');
                  handleClearSimulatedForm();
                }}
                className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  simulatedPortal === 'commonapp'
                    ? 'bg-[#1A1A1A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Common App
              </button>
            </div>

            <button
              onClick={handleClearSimulatedForm}
              className="px-3 py-1 border border-[#1A1A1A] bg-white hover:bg-[#1A1A1A] hover:text-white transition-all text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Form</span>
            </button>
          </div>
        </div>

        <p className="px-6 pt-4 text-xs text-[#1A1A1A]/70">
          A conceptual preview of dossier-driven autofill on the <strong>{simulatedPortal === 'uc' ? 'University of California (UC) Application Portal' : 'Common Application Portal'}</strong>. Click the <strong>Collegeify Extension Icon</strong> in the simulated browser toolbar or click <strong>Autofill Page Now</strong>. The real downloadable extension (below) targets the UC Application specifically and uses its own resume/transcript import flow rather than this dossier.
        </p>

        {/* Simulated Chrome Browser Wrapper */}
        <div className="p-4 sm:p-6">
          <div className="border border-[#1A1A1A] rounded-t-lg bg-[#EFECE6] overflow-hidden shadow-sm">
            {/* Chrome Browser Header */}
            <div className="bg-[#E2DDD3] border-b border-[#1A1A1A] px-4 py-2 flex items-center justify-between gap-3">
              {/* Traffic Lights */}
              <div className="flex items-center space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400 border border-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500"></div>
              </div>

              {/* Address Bar */}
              <div className="flex-1 max-w-xl bg-white border border-[#1A1A1A] px-3 py-1 rounded text-xs font-mono text-gray-700 flex items-center justify-between shadow-inner">
                <span className="truncate">
                  {simulatedPortal === 'uc'
                    ? 'https://apply.universityofcalifornia.edu/my-application/2026/personal-insight-questions'
                    : 'https://apply.commonapp.org/college-admissions/2026/application'}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1" />
              </div>

              {/* Toolbar Icons & Extension Action Badge */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setIsExtensionPopupOpen(!isExtensionPopupOpen)}
                    title="Click to toggle Collegeify Extension Popup"
                    className={`w-7 h-7 border border-[#1A1A1A] flex items-center justify-center font-serif italic text-xs font-bold transition-all ${
                      isExtensionPopupOpen
                        ? 'bg-[#10b981] text-black shadow-[2px_2px_0px_0px_#1A1A1A]'
                        : 'bg-white text-black hover:bg-[#10b981]/20'
                    }`}
                  >
                    C
                  </button>

                  {/* SIMULATED CHROME EXTENSION POPUP OVERLAY */}
                  {isExtensionPopupOpen && (
                    <div className="absolute right-0 top-9 w-80 bg-[#F9F7F2] border-2 border-[#1A1A1A] shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)] z-30 p-4 font-sans text-[#1A1A1A] animate-fadeIn">
                      <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-[#1A1A1A] text-white font-serif italic text-xs font-bold flex items-center justify-center">
                            C
                          </div>
                          <div>
                            <h4 className="font-serif italic font-bold text-sm leading-none">Collegeify</h4>
                            <p className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Chrome Extension</p>
                          </div>
                        </div>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 border border-emerald-300">
                          ONLINE
                        </span>
                      </div>

                      {/* Active Profile Info */}
                      <div className="bg-white border border-[#1A1A1A] p-2.5 mb-3 shadow-[2px_2px_0px_0px_#1A1A1A]">
                        <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Dossier</div>
                        <div className="font-bold text-sm truncate">{appData.applicantName || 'Student Name'}</div>
                        <div className="text-[10px] text-gray-600 truncate">
                          Major: {appData.intendedMajor || 'Undecided'} • GPA {appData.gpa || 'N/A'}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <button
                          onClick={handleSimulatedAutofill}
                          className="w-full py-2 bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 shadow-[2px_2px_0px_0px_#10b981] transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>⚡ Autofill Page Now</span>
                        </button>
                      </div>

                      {autofillSuccessMessage && (
                        <div className="mt-2 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-300 p-1.5 text-center animate-fadeIn">
                          {autofillSuccessMessage}
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-gray-300 text-[9px] text-center text-gray-500">
                        Detects Common App, Coalition & Portal Fields
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Simulated Page Content */}
            <div className="bg-white p-6 sm:p-8 border-t border-[#1A1A1A] min-h-[420px] font-sans">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="border-b border-[#1A1A1A] pb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-serif italic text-xl font-bold">
                      {simulatedPortal === 'uc'
                        ? 'University of California (UC) Undergraduate Application'
                        : 'The Common Application 2026'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {simulatedPortal === 'uc'
                        ? 'UC Personal Insight Questions (PIQs) & Student Profile Section'
                        : 'General Information & Personal Dossier Section'}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold bg-[#F2EDE4] px-2 py-1 border border-[#1A1A1A]">
                    {simulatedPortal === 'uc' ? 'UC ADMISSIONS PORTAL' : 'COLLEGE ADMISSIONS FORM'}
                  </span>
                </div>

                {/* Form Inputs Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'Full Legal Name (UC Profile)' : 'Full Applicant Name'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="applicantName"
                      placeholder="e.g. Eleanor Vance"
                      value={simulatedFields.applicantName}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, applicantName: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('applicantName')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'UC Contact Email' : 'Email Address'} <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="student@example.edu"
                      value={simulatedFields.email}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, email: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('email')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>

                  {/* High School */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'Secondary High School (CEEB)' : 'Secondary High School'}
                    </label>
                    <input
                      type="text"
                      name="highSchool"
                      placeholder="High School Name"
                      value={simulatedFields.highSchool}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, highSchool: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('highSchool')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>

                  {/* GPA */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'UC A-G Coursework GPA' : 'Cumulative GPA (4.0 Scale)'}
                    </label>
                    <input
                      type="text"
                      name="gpa"
                      placeholder="3.95"
                      value={simulatedFields.gpa}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, gpa: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('gpa')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>

                  {/* Test Scores */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'AP Exam & Standardized Scores' : 'SAT / ACT Standardized Scores'}
                    </label>
                    <input
                      type="text"
                      name="testScores"
                      placeholder="SAT 1540 (Math 780, EBRW 760)"
                      value={simulatedFields.testScores}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, testScores: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('testScores')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>

                  {/* Intended Major */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {simulatedPortal === 'uc' ? 'First Choice UC Major & Campus' : 'Intended Academic Major'}
                    </label>
                    <input
                      type="text"
                      name="intendedMajor"
                      placeholder="Computer Science & Economics"
                      value={simulatedFields.intendedMajor}
                      onChange={(e) => setSimulatedFields({ ...simulatedFields, intendedMajor: e.target.value })}
                      className={`w-full px-3 py-2 text-xs border transition-all ${
                        highlightedFields.includes('intendedMajor')
                          ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                          : 'border-[#1A1A1A] bg-white'
                      }`}
                    />
                  </div>
                </div>

                {/* Personal Essay Textarea */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {simulatedPortal === 'uc'
                      ? 'UC Personal Insight Question 1 (PIQ 1) — Leadership & Impact (350 Words)'
                      : 'Personal Statement Essay Prompt (650 Words Max)'}
                  </label>
                  <textarea
                    rows={4}
                    name="personalStatement"
                    placeholder="Paste or write your essay response here..."
                    value={simulatedFields.personalStatement}
                    onChange={(e) => setSimulatedFields({ ...simulatedFields, personalStatement: e.target.value })}
                    className={`w-full px-3 py-2 text-xs border font-serif transition-all ${
                      highlightedFields.includes('personalStatement')
                        ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400/50'
                        : 'border-[#1A1A1A] bg-white'
                    }`}
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: CHROME EXTENSION INSTALLATION GUIDE */}
      <div id="installation-guide" className="bg-[#F2EDE4] border border-[#1A1A1A] p-6 sm:p-8 shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="flex flex-wrap items-center justify-between border-b border-[#1A1A1A] pb-4 mb-6 gap-3">
          <div className="flex items-center space-x-3">
            <Chrome className="w-6 h-6 text-emerald-600" />
            <div>
              <h3 className="font-serif italic text-2xl font-bold text-[#1A1A1A]">How to Install in Google Chrome</h3>
              <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">4 Easy Steps to Load Unpacked Extension</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-[#1A1A1A] p-5 shadow-[2px_2px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-white font-bold text-sm flex items-center justify-center font-serif">
              1
            </div>
            <h4 className="font-bold text-sm">Download ZIP</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Click the green <strong>Download Chrome Extension (.zip)</strong> button above to save the extension package.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-[#1A1A1A] p-5 shadow-[2px_2px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-white font-bold text-sm flex items-center justify-center font-serif">
              2
            </div>
            <h4 className="font-bold text-sm">Extract Folder</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Unzip the downloaded file onto your computer desktop or downloads directory.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-[#1A1A1A] p-5 shadow-[2px_2px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#1A1A1A] text-white font-bold text-sm flex items-center justify-center font-serif">
              3
            </div>
            <h4 className="font-bold text-sm">Open Extensions</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Open Chrome and navigate to <code className="bg-gray-100 px-1 border border-gray-300 rounded text-[11px]">chrome://extensions</code>. Enable <strong>Developer mode</strong> in the top right.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-[#1A1A1A] p-5 shadow-[2px_2px_0px_0px_#1A1A1A] space-y-3">
            <div className="w-8 h-8 bg-[#10b981] text-black font-bold text-sm flex items-center justify-center font-serif">
              4
            </div>
            <h4 className="font-bold text-sm">Load Unpacked</h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Click <strong>Load unpacked</strong> and select the unzipped extension directory. Pin Collegeify to start autofilling!
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: EXTENSION SOURCE CODE INSPECTOR */}
      <div className="bg-white border border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A]">
        <div className="bg-[#1A1A1A] text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif italic text-lg font-bold">
              UC App Autofill — Source Code (Manifest V3)
            </h3>
          </div>

          <button
            onClick={handleCopyCode}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all text-white"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Code!' : 'Copy Selected File'}</span>
          </button>
        </div>

        {/* File Tabs */}
        <div className="border-b border-[#1A1A1A] bg-[#F9F7F2] px-4 pt-3 flex overflow-x-auto gap-2">
          <button
            onClick={() => setActiveCodeFile('manifest')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'manifest'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            manifest.json
          </button>

          <button
            onClick={() => setActiveCodeFile('content')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'content'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            content.js (DOM Engine)
          </button>

          <button
            onClick={() => setActiveCodeFile('popupJs')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'popupJs'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            popup.js
          </button>

          <button
            onClick={() => setActiveCodeFile('popupHtml')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'popupHtml'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            popup.html
          </button>

          <button
            onClick={() => setActiveCodeFile('background')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'background'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            background.js (Gemma AI)
          </button>

          <button
            onClick={() => setActiveCodeFile('sampleResume')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'sampleResume'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            sample-resume.txt
          </button>

          <button
            onClick={() => setActiveCodeFile('sampleTranscript')}
            className={`px-3 py-2 text-xs font-mono font-bold border-t border-x transition-all ${
              activeCodeFile === 'sampleTranscript'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-[#1A1A1A]/70 border-[#1A1A1A] hover:bg-[#EFECE6]'
            }`}
          >
            sample-transcript.txt
          </button>
        </div>

        {/* Code Content Window */}
        <div className="p-4 bg-[#1e293b] text-gray-100 overflow-x-auto text-xs font-mono leading-relaxed max-h-96">
          <pre>{getActiveCodeContent()}</pre>
        </div>
      </div>
    </div>
  );
};
