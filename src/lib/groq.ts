import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

if (!GROQ_API_KEY) {
  throw new Error('Missing GROQ API key environment variable');
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export const generateContent = async (query: string): Promise<string> => {
  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a knowledge base generator that creates comprehensive, well-structured content similar to Wikipedia articles. 
      Format your response using Markdown with proper headings (##, ###), lists, tables, and emphasis where appropriate.
      Include an introduction, multiple sections with headings, and a conclusion.
      Make the content informative, accurate, and educational.
      Do not mention that you are an AI or that this is a generated response.
      Respond only with the formatted content.`
    },
    {
      role: 'user',
      content: `Create a comprehensive knowledge base article about: ${query}`
    }
  ];

  try {
    console.log('Generating content for query:', query);
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_completion_tokens: 1024,
        top_p: 1,
        stream: false,
        stop: null
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        }
      }
    );

    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response from Groq API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again later.');
  }
};