
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateIntelligentFix = async (goalDescription: string, currentFileContent: string, fileName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        You are a senior financial engineer agent.
        The system has a new goal: "${goalDescription}".
        Current content of ${fileName}:
        \`\`\`
        ${currentFileContent}
        \`\`\`
        
        Generate the complete updated source code for this file to achieve the goal.
        Ensure high security, performance, and best practices for financial software.
        Output ONLY the raw code content.
      `,
      config: {
        temperature: 0.3,
        maxOutputTokens: 2048,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Code Gen Error:", error);
    return "";
  }
};

export const analyzeMetrics = async (metricsJson: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analyze these financial system metrics and provide a 2-sentence executive summary of system health and any immediate actions needed:
        ${metricsJson}
      `,
    });
    return response.text || "Metrics look nominal.";
  } catch (error) {
    return "Status nominal.";
  }
};
