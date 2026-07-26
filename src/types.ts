export interface ActivityItem {
  id: string;
  title: string;
  organization: string;
  role: string;
  grades: string[]; // e.g. ["10", "11", "12"]
  hoursPerWeek: number;
  weeksPerYear: number;
  description: string;
}

export interface HonorItem {
  id: string;
  title: string;
  gradeLevel: string;
  levelOfRecognition: 'School' | 'State/Regional' | 'National' | 'International';
}

export interface CollegeApplicationData {
  applicantName: string;
  email: string;
  phone: string;
  address: string;
  dob: string;
  highSchool: string;
  gpa: string;
  testScores: string;
  intendedMajor: string;
  targetColleges: string[];
  
  // Essays
  personalStatementPrompt: string;
  personalStatement: string;
  supplementalEssay1Prompt: string;
  supplementalEssay1: string;

  // Activities & Honors
  activities: ActivityItem[];
  honors: HonorItem[];

  // Signatures
  signatureName: string;
  signatureDate: string;
}

export interface EssayFeedbackItem {
  originalText: string;
  suggestedText: string;
  category: 'Cliché' | 'Hook Strength' | 'Tone & Clarity' | 'Grammar & Flow' | 'Show Don\'t Tell';
  reasoning: string;
}

export interface ActivityOptimization {
  activityId: string;
  originalDescription: string;
  optimizedDescription: string;
  keyImprovements: string[];
}

export interface ApplicationAnalysisResult {
  overallScore: number; // 1 - 100
  competitivenessTier: 'Reach Potential' | 'Strong Competitive' | 'Exceptional / Top Tier' | 'Needs Major Refinement';
  overallSummary: string;
  strengths: string[];
  weaknesses: string[];
  
  essayFeedback: {
    hookRating: number; // 1 - 10
    voiceAuthenticityScore: number; // 1 - 10
    inlineSuggestions: EssayFeedbackItem[];
    improvedVersion: string;
  };

  activityOptimizations: ActivityOptimization[];
  
  targetCollegeAdvice: {
    college: string;
    fitScore: number;
    strategicTip: string;
  }[];
}

export interface SavedDossier {
  id: string;
  userId: string;
  title: string;
  data: CollegeApplicationData;
  analysis: ApplicationAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
}
