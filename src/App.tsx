import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { DatabaseDossierManager } from './components/DatabaseDossierManager';
import { ApplicationFormTab } from './components/ApplicationFormTab';
import { AIFeedbackTab } from './components/AIFeedbackTab';
import { ChromeExtensionTab } from './components/ChromeExtensionTab';
import { CollegeApplicationData, ApplicationAnalysisResult, SavedDossier } from './types';
import { SAMPLE_APPLICATIONS, EMPTY_APPLICATION_DATA } from './data/sampleApplications';
import {
  initializeDatabaseAuth, 
  subscribeToDossiers, 
  saveDossierToDb, 
  deleteDossierFromDb 
} from './lib/firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'application' | 'feedback' | 'extension'>('application');
  const [appData, setAppData] = useState<CollegeApplicationData>(EMPTY_APPLICATION_DATA);
  const [analysis, setAnalysis] = useState<ApplicationAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Firestore Database State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [savedDossiers, setSavedDossiers] = useState<SavedDossier[]>([]);
  const [activeDossierId, setActiveDossierId] = useState<string | null>(null);
  const [isSavingToDb, setIsSavingToDb] = useState(false);
  const [isDbConnected, setIsDbConnected] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  // Track whether initial hydration has happened
  const isHydratedRef = useRef(false);

  // 1. Initialize Firebase Auth and Subscribe to Firestore Database
  useEffect(() => {
    const unsubscribeAuth = initializeDatabaseAuth((user) => {
      setCurrentUser(user);
      setIsDbConnected(true);

      const unsubscribeSnapshot = subscribeToDossiers(
        user.uid,
        async (dossiers) => {
          setSavedDossiers(dossiers);

          // If user has no dossiers saved in database yet, create initial blank seed document
          if (dossiers.length === 0 && !isHydratedRef.current) {
            isHydratedRef.current = true;
            const seedTitle = `My College Application`;
            const seedId = await saveDossierToDb({
              userId: user.uid,
              title: seedTitle,
              data: EMPTY_APPLICATION_DATA,
              analysis: null,
            });
            setActiveDossierId(seedId);
            setAppData(EMPTY_APPLICATION_DATA);
            setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          } else if (!isHydratedRef.current && dossiers.length > 0) {
            isHydratedRef.current = true;
            const first = dossiers[0];
            setActiveDossierId(first.id);
            if (first.data.applicantName === 'Alex Rivera') {
              setAppData(EMPTY_APPLICATION_DATA);
              saveDossierToDb({
                id: first.id,
                userId: user.uid,
                title: 'My College Application',
                data: EMPTY_APPLICATION_DATA,
                analysis: null,
              });
            } else {
              setAppData(first.data);
            }
            if (first.analysis && first.data.applicantName !== 'Alex Rivera') setAnalysis(first.analysis);
            setLastSavedTime(new Date(first.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          }
        },
        (err) => {
          console.error('Firestore Error:', err);
          setIsDbConnected(false);
        }
      );

      return () => unsubscribeSnapshot();
    });

    return () => unsubscribeAuth();
  }, []);

  // Save current active state to Firestore
  const handleSaveCurrentToDb = async (customTitle?: string) => {
    if (!currentUser) return;
    setIsSavingToDb(true);
    try {
      const existingDossier = savedDossiers.find((d) => d.id === activeDossierId);
      const title = customTitle || existingDossier?.title || `${appData.applicantName || 'Applicant'} General Information`;

      const savedId = await saveDossierToDb({
        id: activeDossierId || undefined,
        userId: currentUser.uid,
        title,
        data: appData,
        analysis,
      });

      setActiveDossierId(savedId);
      const nowFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedTime(nowFormatted);
    } catch (err) {
      console.error('Save to database error:', err);
      alert('Could not save document to Firestore database. Please try again.');
    } finally {
      setIsSavingToDb(false);
    }
  };

  // Switch Active Dossier from Database
  const handleSelectDossier = (dossier: SavedDossier) => {
    setActiveDossierId(dossier.id);
    setAppData(dossier.data);
    setAnalysis(dossier.analysis || null);
    setLastSavedTime(new Date(dossier.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Create New Blank Dossier in Database
  const handleCreateNewDossier = async () => {
    if (!currentUser) return;
    const blankData = EMPTY_APPLICATION_DATA;

    const savedId = await saveDossierToDb({
      userId: currentUser.uid,
      title: 'New Blank Application',
      data: blankData,
      analysis: null,
    });

    setActiveDossierId(savedId);
    setAppData(blankData);
    setAnalysis(null);
    setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  // Clear Form handler
  const handleClearForm = async () => {
    setAppData(EMPTY_APPLICATION_DATA);
    setAnalysis(null);
    if (currentUser) {
      const savedId = await saveDossierToDb({
        id: activeDossierId || undefined,
        userId: currentUser.uid,
        title: 'My Blank Application',
        data: EMPTY_APPLICATION_DATA,
        analysis: null,
      });
      setActiveDossierId(savedId);
      setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
  };

  // Delete Dossier from Database
  const handleDeleteDossier = async (id: string) => {
    await deleteDossierFromDb(id);
    const remaining = savedDossiers.filter((d) => d.id !== id);
    if (remaining.length > 0) {
      handleSelectDossier(remaining[0]);
    } else {
      await handleCreateNewDossier();
    }
  };

  // Run AI Admissions Review on current application data
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appData),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
        setActiveTab('feedback');

        // Automatically update record in Firestore with newly generated analysis
        if (currentUser) {
          await saveDossierToDb({
            id: activeDossierId || undefined,
            userId: currentUser.uid,
            title: savedDossiers.find((d) => d.id === activeDossierId)?.title || `${appData.applicantName} Application`,
            data: appData,
            analysis: json.data,
          });
          setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }
      } else {
        alert(json.error || 'Failed to analyze application. Please try again.');
      }
    } catch (err: any) {
      console.error(err);
      alert('Error connecting to server. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load sample dataset & save to database
  const handleLoadSample = async (sampleId: string) => {
    const found = SAMPLE_APPLICATIONS.find((s) => s.id === sampleId);
    if (found) {
      setAppData(found.data);
      setAnalysis(null);

      if (currentUser) {
        const newDossierId = await saveDossierToDb({
          userId: currentUser.uid,
          title: `${found.data.applicantName} — ${found.label}`,
          data: found.data,
          analysis: null,
        });
        setActiveDossierId(newDossierId);
        setLastSavedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#1A1A1A] selection:text-white">
      {/* Header Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasAnalysis={!!analysis}
        onLoadSample={handleLoadSample}
        onClearForm={handleClearForm}
      />

      {/* Database Dossier Manager Toolbar */}
      <DatabaseDossierManager
        savedDossiers={savedDossiers}
        activeDossierId={activeDossierId}
        onSelectDossier={handleSelectDossier}
        onSaveCurrentToDb={handleSaveCurrentToDb}
        onCreateNewDossier={handleCreateNewDossier}
        onDeleteDossier={handleDeleteDossier}
        isSaving={isSavingToDb}
        isDbConnected={isDbConnected}
        lastSavedTime={lastSavedTime}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'application' && (
          <ApplicationFormTab
            appData={appData}
            setAppData={setAppData}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
            onLoadSample={handleLoadSample}
            onClearForm={handleClearForm}
          />
        )}

        {activeTab === 'feedback' && (
          <AIFeedbackTab
            analysis={analysis}
            appData={appData}
            setAppData={setAppData}
            onRunAnalysis={handleRunAnalysis}
            isAnalyzing={isAnalyzing}
          />
        )}

        {activeTab === 'extension' && (
          <ChromeExtensionTab
            appData={appData}
          />
        )}
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[#1A1A1A] bg-white py-8 text-center text-xs text-[#1A1A1A]/70 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <span className="font-serif italic font-bold text-lg text-[#1A1A1A]">Collegeify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
