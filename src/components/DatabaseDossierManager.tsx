import React, { useState } from 'react';
import { Database, Cloud, Save, Plus, Trash2, Copy, Check, RefreshCw, FolderOpen, X } from 'lucide-react';
import { SavedDossier } from '../types';

interface DatabaseDossierManagerProps {
  savedDossiers: SavedDossier[];
  activeDossierId: string | null;
  onSelectDossier: (dossier: SavedDossier) => void;
  onSaveCurrentToDb: (customTitle?: string) => Promise<void>;
  onCreateNewDossier: () => void;
  onDeleteDossier: (id: string) => Promise<void>;
  isSaving: boolean;
  isDbConnected: boolean;
  lastSavedTime: string | null;
}

export const DatabaseDossierManager: React.FC<DatabaseDossierManagerProps> = ({
  savedDossiers,
  activeDossierId,
  onSelectDossier,
  onSaveCurrentToDb,
  onCreateNewDossier,
  onDeleteDossier,
  isSaving,
  isDbConnected,
  lastSavedTime,
}) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const activeDossier = savedDossiers.find((d) => d.id === activeDossierId);

  const handleManualSave = async () => {
    await onSaveCurrentToDb(newTitle || undefined);
    setNewTitle('');
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 2500);
  };

  return (
    <div className="bg-white border-b border-[#1A1A1A] py-2.5 px-4 sm:px-6 lg:px-8 text-xs font-sans no-print shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Active Record Indicator */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold">Active Record:</span>
            <span className="font-serif italic font-bold text-sm text-[#1A1A1A]">
              {activeDossier ? activeDossier.title : 'Unsaved Local Draft'}
            </span>
            {lastSavedTime && (
              <span className="text-[9px] uppercase tracking-wider text-[#1A1A1A]/50 font-medium hidden sm:inline">
                • Saved {lastSavedTime}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : showSaveSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? 'Saving to Cloud...' : showSaveSuccess ? 'Saved to Database!' : 'Save Record'}</span>
          </button>

          <button
            onClick={() => setIsOpenModal(true)}
            className="px-3 py-1.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] text-[10px] uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Saved Records ({savedDossiers.length})</span>
          </button>
        </div>
      </div>

      {/* Cloud Database Modal */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] w-full max-w-2xl shadow-[8px_8px_0px_0px_#1A1A1A] p-6 space-y-6 relative max-h-[85vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/20 pb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#1A1A1A]/50">Persistent Storage</p>
                <h3 className="text-xl font-serif font-light text-[#1A1A1A]">Save</h3>
              </div>
              
              <button
                onClick={() => setIsOpenModal(false)}
                className="p-1 hover:bg-[#F9F7F2] border border-transparent hover:border-[#1A1A1A] transition-all"
              >
                <X className="w-5 h-5 text-[#1A1A1A]" />
              </button>
            </div>

            {/* Save Current Section */}
            <div className="p-4 bg-[#F9F7F2] border border-[#1A1A1A] space-y-2">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">
                Save Current Application to Cloud Database
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Alex Rivera - MIT Early Action"
                  className="flex-1 bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] focus:outline-none font-serif"
                />
                <button
                  onClick={async () => {
                    await handleManualSave();
                  }}
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold transition-all"
                >
                  Save New Record
                </button>
              </div>
            </div>

            {/* Saved Records List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {savedDossiers.length === 0 ? (
                <div className="text-center py-8 text-[#1A1A1A]/60 space-y-2">
                  <FolderOpen className="w-8 h-8 mx-auto text-[#1A1A1A]/40" />
                  <p className="text-xs font-serif italic">No application records saved in cloud database yet.</p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold">
                    Click "Save New Record" above to persist your current application data.
                  </p>
                </div>
              ) : (
                savedDossiers.map((dossier) => {
                  const isActive = dossier.id === activeDossierId;
                  return (
                    <div
                      key={dossier.id}
                      className={`p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-white border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A]'
                          : 'bg-[#F9F7F2] border-[#1A1A1A]/30 hover:border-[#1A1A1A]'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-serif italic font-bold text-base text-[#1A1A1A]">
                            {dossier.title}
                          </span>
                          {isActive && (
                            <span className="text-[8px] uppercase tracking-widest font-bold bg-[#1A1A1A] text-white px-2 py-0.5">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#1A1A1A]/80 font-sans">
                          {dossier.data.applicantName || 'Unnamed Student'} • Major: {dossier.data.intendedMajor || 'Undecided'}
                        </p>
                        <p className="text-[10px] uppercase tracking-wider text-[#1A1A1A]/50 font-semibold">
                          Target Colleges: {dossier.data.targetColleges?.join(', ') || 'None listed'} • Updated: {new Date(dossier.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {!isActive && (
                          <button
                            onClick={() => {
                              onSelectDossier(dossier);
                              setIsOpenModal(false);
                            }}
                            className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-black text-white text-[10px] uppercase tracking-widest font-bold transition-all"
                          >
                            Load Record
                          </button>
                        )}

                        <button
                          onClick={async () => {
                            if (confirm(`Are you sure you want to delete "${dossier.title}" from the cloud database?`)) {
                              await onDeleteDossier(dossier.id);
                            }
                          }}
                          className="p-1.5 text-[#1A1A1A]/60 hover:text-rose-600 transition-colors border border-transparent hover:border-[#1A1A1A]"
                          title="Delete application record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#1A1A1A]/20 flex justify-between items-center text-[10px] uppercase tracking-wider text-[#1A1A1A]/60 font-semibold">
              <span>All records synced</span>
              <button
                onClick={() => {
                  onCreateNewDossier();
                  setIsOpenModal(false);
                }}
                className="px-3 py-1.5 bg-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] font-bold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Blank Application</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
