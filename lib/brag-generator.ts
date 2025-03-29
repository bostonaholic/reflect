import { callOpenAI } from './openai';
import { formatDateForDisplay } from './date-utils';

const BRAG_PROMPT = `You are an expert at creating professional software engineering brag documents. 
Given a technical summary of contributions over a specific time period, create a compelling professional document that:
1. Highlights technical achievements and improvements in a way that demonstrates expertise
2. Emphasizes impact on the codebase and team, focusing on business value
3. Showcases problem-solving abilities through specific examples
4. Demonstrates leadership and collaboration through concrete instances
5. Illustrates innovation and creativity in technical solutions

Format the output as a professional markdown document with clear sections and bullet points.
Focus on quantifiable results and specific technical contributions where possible.
Make the language more achievement-oriented and impactful than the technical summary.
Include the time period in the introduction and conclusion to provide context for the achievements.`;

export async function generateBragDocument(summary: string, apiKey: string, startDate: Date, endDate: Date): Promise<string> {
  const content = `Time Period: From ${formatDateForDisplay(startDate)} to ${formatDateForDisplay(endDate)}\n\n${summary}`;
  return callOpenAI(BRAG_PROMPT, content, apiKey);
} 