import React from 'react';
import { Sparkles, FileText, Chrome } from 'lucide-react';

interface HeaderProps {
  activeTab: 'application' | 'feedback' | 'extension';
  setActiveTab: (tab: 'application' | 'feedback' | 'extension') => void;
  hasAnalysis: boolean;
  onLoadSample: (sampleId: string) => void;
  onClearForm?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  hasAnalysis,
  onLoadSample,
  onClearForm,
}) => {
  return (
    <header className="bg-white border-b border-[#1A1A1A] text-[#1A1A1A] sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Branding - Collegeify */}
          <div className="flex items-center space-x-4">
            <div className="w-9 h-9 border border-[#1A1A1A] bg-[#F9F7F2] flex items-center justify-center font-serif italic text-lg font-bold shadow-[2px_2px_0px_0px_#1A1A1A]">
              C
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-serif italic text-2xl tracking-tighter font-bold text-[#1A1A1A]">Collegeify</h1>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold hidden md:block">
                College Essay Analysis & Chrome Application Autofill Portal
              </p>
            </div>
          </div>

          {/* Quick Presets Dropdown */}
          <div className="hidden lg:flex items-center space-x-2 text-[10px] uppercase tracking-wider font-bold">
            {onClearForm && (
              <button
                onClick={onClearForm}
                className="px-2.5 py-1 border border-[#1A1A1A] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all text-[#1A1A1A] bg-white mr-1"
                title="Clear all inputs to start with a blank application"
              >
                Clear Form
              </button>
            )}
            <span className="text-[#1A1A1A]/50 mr-1">Samples:</span>
            <button
              onClick={() => onLoadSample('stanford-cs')}
              className="px-2.5 py-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-[#1A1A1A] bg-[#F9F7F2]"
            >
              Stanford CS
            </button>
            <button
              onClick={() => onLoadSample('harvard-premed')}
              className="px-2.5 py-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all text-[#1A1A1A] bg-[#F9F7F2]"
            >
              Harvard Bio
            </button>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('application')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                activeTab === 'application'
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">1. Application</span>
            </button>

            <button
              onClick={() => setActiveTab('feedback')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all relative ${
                activeTab === 'feedback'
                  ? 'bg-[#1A1A1A] text-white shadow-sm'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">2. AI Feedback</span>
              {hasAnalysis && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('extension')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                activeTab === 'extension'
                  ? 'bg-[#10b981] text-black shadow-sm font-black'
                  : 'text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:bg-[#F2EDE4]'
              }`}
            >
              <Chrome className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">3. Chrome Extension</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};
