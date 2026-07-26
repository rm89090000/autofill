import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const applicationData = {
  applicantName: "Test Student",
  intendedMajor: "Computer Science",
  targetColleges: ["MIT"],
  gpa: "3.9",
  testScores: "1500 SAT",
  personalStatementPrompt: "Common App",
  personalStatement: "I have always loved building things.",
  activities: [],
  honors: [],
};

const prompt = `
You are a senior dean of admissions and college admissions consultant at an elite university (e.g. Stanford, Harvard, MIT, UC Berkeley).
Analyze the following college application submission thoroughly.

Applicant Name: ${applicationData.applicantName}
Intended Major: ${applicationData.intendedMajor}
Target Colleges: ${JSON.stringify(applicationData.targetColleges)}
GPA & Test Scores: ${applicationData.gpa} | ${applicationData.testScores}

Personal Statement Prompt:
"${applicationData.personalStatementPrompt}"

Personal Statement Essay:
"""
${applicationData.personalStatement}
"""

Extracurricular Activities:
${JSON.stringify(applicationData.activities, null, 2)}

Honors & Awards:
${JSON.stringify(applicationData.honors, null, 2)}

Provide a deep, constructive admissions evaluation in valid JSON matching this structure:
{
  "overallScore": number,
  "competitivenessTier": string,
  "overallSummary": string,
  "strengths": string[],
  "weaknesses": string[],
  "essayFeedback": { "hookRating": number, "voiceAuthenticityScore": number, "inlineSuggestions": [{"originalText": string, "suggestedText": string, "category": string, "reasoning": string}], "improvedVersion": string },
  "activityOptimizations": [{"activityId": string, "originalDescription": string, "optimizedDescription": string, "keyImprovements": string[]}],
  "targetCollegeAdvice": [{"college": string, "fitScore": number, "strategicTip": string}]
}
`;

const res = await ai.models.generateContent({
  model: "gemma-4-26b-a4b-it",
  contents: prompt,
  config: {
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      properties: {
        overallScore: { type: Type.NUMBER },
        competitivenessTier: { type: Type.STRING },
        overallSummary: { type: Type.STRING },
        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        essayFeedback: {
          type: Type.OBJECT,
          properties: {
            hookRating: { type: Type.NUMBER },
            voiceAuthenticityScore: { type: Type.NUMBER },
            inlineSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  originalText: { type: Type.STRING },
                  suggestedText: { type: Type.STRING },
                  category: { type: Type.STRING },
                  reasoning: { type: Type.STRING },
                },
                required: ["originalText", "suggestedText", "category", "reasoning"],
              },
            },
            improvedVersion: { type: Type.STRING },
          },
          required: ["hookRating", "voiceAuthenticityScore", "inlineSuggestions", "improvedVersion"],
        },
        activityOptimizations: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              activityId: { type: Type.STRING },
              originalDescription: { type: Type.STRING },
              optimizedDescription: { type: Type.STRING },
              keyImprovements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["activityId", "originalDescription", "optimizedDescription"],
          },
        },
        targetCollegeAdvice: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              college: { type: Type.STRING },
              fitScore: { type: Type.NUMBER },
              strategicTip: { type: Type.STRING },
            },
            required: ["college", "fitScore", "strategicTip"],
          },
        },
      },
      required: [
        "overallScore",
        "competitivenessTier",
        "overallSummary",
        "strengths",
        "weaknesses",
        "essayFeedback",
        "activityOptimizations",
        "targetCollegeAdvice",
      ],
    },
  },
});

console.log("LENGTH:", res.text?.length);
console.log("RAW TEXT:\n", res.text);
console.log("--- finishReason ---", JSON.stringify(res.candidates?.[0]?.finishReason));
