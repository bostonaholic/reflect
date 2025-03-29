import chalk from 'chalk';

export async function callOpenAI(prompt: string, content: string, apiKey: string): Promise<string> {
  try {
    console.log(chalk('🤖 Making OpenAI API request...'));
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error(chalk('❌ OpenAI API Error Details:'), {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(chalk('❌ Error in OpenAI API call:'), error);
    if (error instanceof Error) {
      console.error(chalk('Error message:'), error.message);
    }
    throw error;
  }
} 