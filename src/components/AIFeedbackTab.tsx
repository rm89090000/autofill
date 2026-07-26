import React, { useState } from 'react';
import { ApplicationAnalysisResult, CollegeApplicationData } from '../types';
import { Sparkles, CheckCircle2, AlertCircle, Award, Target, ArrowRight, RefreshCw, FileCheck, ThumbsUp } from 'lucide-react';

interface AIFeedbackTabProps {
  analysis: ApplicationAnalysisResult | null;
  appData: CollegeApplicationData;
  setAppData: React.Dispatch<React.SetStateAction<CollegeApplicationData>>;
  onRunAnalysis: () => void;
  isAnalyzing: boolean;
}

export const AIFeedbackTab: React.FC<AIFeedbackTabProps> = ({
  analysis,
  appData,
  setAppData,
  onRunAnalysis,
  isAnalyzing,
}) => {
  const [appliedSuggestions, setAppliedSuggestions] = useState<Record<number, boolean>>({});
  const [appliedWholeEssay, setAppliedWholeEssay] = useState(false);
  const [appliedActivities, setAppliedActivities] = useState<Record<string, boolean>>({});

  if (!analysis) {
    return (
      <div className="bg-white border border-[#1A1A1A] p-12 text-center text-[#1A1A1A] shadow-md space-y-5">
        <div className="w-16 h-16 border border-[#1A1A1A] bg-[#F9F7F2] text-[#1A1A1A] flex items-center justify-center mx-auto shadow-[3px_3px_0px_0px_#1A1A1A]">
          <Sparkles className="w-8 h-8 text-amber-600" />
        </div>
        <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#1A1A1A]/50">Admissions Evaluation Suite</p>
        <h3 className="text-3xl font-serif font-light text-[#1A1A1A]">No Admissions Evaluation Generated Yet</h3>
        <p className="text-xs font-serif italic text-[#1A1A1A]/70 max-w-md mx-auto leading-relaxed">
          Click the button below to analyze your college application essays, extracurricular descriptions, and target university fit with Gemini AI.
        </p>
        <button
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          className="px-6 py-3 bg-[#1A1A1A] hover:bg-black text-white font-bold text-xs uppercase tracking-[0.2em] transition-all inline-flex items-center space-x-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isAnalyzing ? 'Evaluating Application...' : 'Run Full AI Admissions Analysis'}</span>
        </button>
      </div>
    );
  }

  // Handle single suggestion replacement
  const handleApplySuggestion = (idx: number, orig: string, suggested: string) => {
    setAppData((prev) => {
      const newEssay = prev.personalStatement.replace(orig, suggested);
      return { ...prev, personalStatement: newEssay };
    });
    setAppliedSuggestions((prev) => ({ ...prev, [idx]: true }));
  };

  // Handle full improved essay apply
  const handleApplyFullEssay = () => {
    if (analysis.essayFeedback?.improvedVersion) {
      setAppData((prev) => ({
        ...prev,
        personalStatement: analysis.essayFeedback.improvedVersion,
      }));
      setAppliedWholeEssay(true);
    }
  };

  // Handle activity description replace
  const handleApplyActivityOptimization = (actId: string, optimizedDesc: string) => {
    setAppData((prev) => {
      const updated = prev.activities.map((act) => {
        if (act.id === actId || act.title === actId || act.organization === actId) {
          return { ...act, description: optimizedDesc };
        }
        return act;
      });
      return { ...prev, activities: updated };
    });
    setAppliedActivities((prev) => ({ ...prev, [actId]: true }));
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Scorecard Header */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#1A1A1A]/20 pb-6">
          
          <div className="flex items-center space-x-6">
            {/* Score Box */}
            <div className="relative flex items-center justify-center">
              <div className="w-24 h-24 border-2 border-[#1A1A1A] bg-[#F9F7F2] flex flex-col items-center justify-center shadow-[4px_4px_0px_0px_#1A1A1A]">
                <span className="text-3xl font-serif italic font-bold text-[#1A1A1A]">{analysis.overallScore}</span>
                <span className="text-[8px] uppercase tracking-widest font-bold text-[#1A1A1A]/60 mt-0.5">Index Score</span>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Competitiveness Rating</span>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 font-bold bg-[#1A1A1A] text-white">
                  {analysis.competitivenessTier}
                </span>
              </div>
              <h2 className="text-2xl font-serif font-light text-[#1A1A1A]">Application Evaluation Summary</h2>
              <p className="text-xs font-serif italic text-[#1A1A1A]/80 mt-1 max-w-xl leading-relaxed">
                {analysis.overallSummary}
              </p>
            </div>
          </div>

          <button
            onClick={onRunAnalysis}
            disabled={isAnalyzing}
            className="px-4 py-2.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold transition-all flex items-center space-x-2 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>Re-Evaluate Application</span>
          </button>
        </div>

        {/* Strengths vs Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
          <div className="bg-[#F9F7F2] border border-[#1A1A1A] p-5">
            <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-3 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
              <span>Key Application Strengths</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#1A1A1A]/80">
              {analysis.strengths.map((str, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[#1A1A1A] font-serif italic font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#F9F7F2] border border-[#1A1A1A] p-5">
            <h4 className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-[0.2em] mb-3 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              <span>Areas Requiring Strategic Refinement</span>
            </h4>
            <ul className="space-y-2 text-xs text-[#1A1A1A]/80">
              {analysis.weaknesses.map((wk, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[#1A1A1A] font-serif italic font-bold">•</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Essay Feedback Section */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1A1A1A]/20 pb-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Editorial Critique</p>
            <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Personal Statement Inline Revisions</h3>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-center px-3 py-1.5 bg-[#F9F7F2] border border-[#1A1A1A]">
              <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">Hook Strength</span>
              <span className="text-sm font-serif italic font-bold text-[#1A1A1A]">{analysis.essayFeedback.hookRating} / 10</span>
            </div>

            <div className="text-center px-3 py-1.5 bg-[#F9F7F2] border border-[#1A1A1A]">
              <span className="text-[8px] uppercase tracking-widest text-[#1A1A1A]/60 block font-bold">Voice Authenticity</span>
              <span className="text-sm font-serif italic font-bold text-[#1A1A1A]">{analysis.essayFeedback.voiceAuthenticityScore} / 10</span>
            </div>
          </div>
        </div>

        {/* Inline Essay Suggestions */}
        <div className="space-y-4">
          {analysis.essayFeedback.inlineSuggestions.map((item, idx) => (
            <div key={idx} className="bg-[#F9F7F2] border border-[#1A1A1A] p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-[0.2em] font-bold px-2.5 py-0.5 bg-[#1A1A1A] text-white">
                  {item.category}
                </span>

                <button
                  disabled={appliedSuggestions[idx]}
                  onClick={() => handleApplySuggestion(idx, item.originalText, item.suggestedText)}
                  className={`text-[10px] uppercase tracking-widest px-3 py-1.5 font-bold transition-all flex items-center space-x-1.5 ${
                    appliedSuggestions[idx]
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#1A1A1A] hover:bg-black text-white'
                  }`}
                >
                  {appliedSuggestions[idx] ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Applied</span>
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Apply Revision</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 border border-[#1A1A1A]/30">
                  <span className="text-[9px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest block mb-1">Current Text</span>
                  <p className="text-[#1A1A1A]/80 font-serif italic">"{item.originalText}"</p>
                </div>

                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <span className="text-[9px] font-bold text-[#1A1A1A] uppercase tracking-widest block mb-1">Recommended Editorial Rewrite</span>
                  <p className="text-[#1A1A1A] font-serif font-bold">"{item.suggestedText}"</p>
                </div>
              </div>

              <p className="text-[11px] text-[#1A1A1A]/80 bg-white p-2.5 border border-[#1A1A1A]/20 font-serif italic">
                <strong className="font-sans font-bold uppercase text-[9px] tracking-widest not-italic block mb-0.5">Strategic Rationale:</strong> {item.reasoning}
              </p>
            </div>
          ))}
        </div>

        {/* Improved Full Essay Accordion */}
        {analysis.essayFeedback.improvedVersion && (
          <div className="mt-6 p-5 bg-[#F2EDE4] border border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center space-x-2">
                  <FileCheck className="w-4 h-4 text-emerald-700" />
                  <span>AI Polished Manuscript Draft</span>
                </h4>
                <p className="text-xs font-serif italic text-[#1A1A1A]/70">Complete refined draft integrating all narrative and structural improvements.</p>
              </div>

              <button
                disabled={appliedWholeEssay}
                onClick={handleApplyFullEssay}
                className={`text-[10px] uppercase tracking-widest px-3.5 py-1.5 font-bold transition-all flex items-center space-x-1.5 ${
                  appliedWholeEssay
                    ? 'bg-emerald-800 text-white'
                    : 'bg-[#1A1A1A] hover:bg-black text-white'
                }`}
              >
                {appliedWholeEssay ? (
                  <>
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>Entire Draft Updated</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Replace Entire Personal Statement</span>
                  </>
                )}
              </button>
            </div>

            <div className="bg-white p-5 border border-[#1A1A1A] text-xs text-[#1A1A1A] leading-relaxed font-serif max-h-60 overflow-y-auto whitespace-pre-wrap">
              {analysis.essayFeedback.improvedVersion}
            </div>
          </div>
        )}
      </div>

      {/* Activity Description Optimizations */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-4">
        <div className="border-b border-[#1A1A1A]/20 pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Resume Optimization</p>
          <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Extracurricular Metric Optimizer</h3>
          <p className="text-xs font-serif italic text-[#1A1A1A]/70 mt-1">
            Active verbs and quantified achievements formatted for 150-character Common App constraints.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {analysis.activityOptimizations.map((act, i) => (
            <div key={i} className="bg-[#F9F7F2] border border-[#1A1A1A] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">{act.activityId}</span>
                <button
                  disabled={appliedActivities[act.activityId]}
                  onClick={() => handleApplyActivityOptimization(act.activityId, act.optimizedDescription)}
                  className={`text-[10px] uppercase tracking-widest px-3 py-1 font-bold transition-all ${
                    appliedActivities[act.activityId]
                      ? 'bg-emerald-800 text-white'
                      : 'bg-[#1A1A1A] hover:bg-black text-white'
                  }`}
                >
                  {appliedActivities[act.activityId] ? 'Applied' : 'Apply Rewrite'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 border border-[#1A1A1A]/30">
                  <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A]/60 font-bold block mb-1">Original Draft</span>
                  <p className="text-[#1A1A1A]/80">{act.originalDescription}</p>
                </div>
                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <span className="text-[9px] uppercase tracking-widest text-[#1A1A1A] font-bold block mb-1">Active & Quantified Version</span>
                  <p className="text-[#1A1A1A] font-semibold">{act.optimizedDescription}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target College Specific Positioning Tips */}
      <div className="bg-white border border-[#1A1A1A] p-6 sm:p-8 text-[#1A1A1A] shadow-sm space-y-4">
        <div className="border-b border-[#1A1A1A]/20 pb-4">
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Strategic Advisory</p>
          <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Target University Alignment Analysis</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {analysis.targetCollegeAdvice.map((col, i) => (
            <div key={i} className="bg-[#F9F7F2] border border-[#1A1A1A] p-5 space-y-2 relative">
              <span className="absolute top-3 right-3 text-2xl font-serif italic text-[#1A1A1A]/20">0{i + 1}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold font-serif text-[#1A1A1A]">{col.college}</span>
                <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 font-bold bg-[#1A1A1A] text-white">
                  Fit: {col.fitScore}%
                </span>
              </div>
              <p className="text-xs font-serif italic text-[#1A1A1A]/80 leading-relaxed pt-1">{col.strategicTip}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
