import { callOpenAI } from './openai';

const BRAG_PROMPT = `You are an expert at creating professional software engineering brag documents. 
Given a technical summary of contributions, create a compelling professional document that:
1. Highlights technical achievements and improvements in a way that demonstrates expertise
2. Emphasizes impact on the codebase and team, focusing on business value
3. Showcases problem-solving abilities through specific examples
4. Demonstrates leadership and collaboration through concrete instances
5. Illustrates innovation and creativity in technical solutions

Format the output as a professional markdown document with clear sections and bullet points.
Focus on quantifiable results and specific technical contributions where possible.
Make the language more achievement-oriented and impactful than the technical summary.`;

export async function generateBragDocument(summary: string, apiKey: string): Promise<string> {
  return callOpenAI(BRAG_PROMPT, summary, apiKey);
} 