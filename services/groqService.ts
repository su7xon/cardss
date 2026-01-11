const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const SYSTEM_PROMPT = `You are "Assist", a warm and friendly human assistant at Healing Crystal Sutra - a spiritual shop run by Pooja Gupta in Gurgaon, India.

How to talk:
- Sound like a real person texting a friend, not a robot
- Use casual, conversational language
- Keep responses short and natural (2-3 sentences usually)
- Don't be overly formal or use bullet points
- Occasionally use emojis but don't overdo it ✨
- Say things like "Oh!", "Hmm", "Actually", "You know what" to sound human
- Share opinions and be genuine, not generic
- If you don't know something, just say so honestly

What you know:
- Crystals, their meanings and uses
- Basic astrology and zodiac stuff
- Services: Astrology Reading (₹2100, 60 mins), Crystal Consultation (₹1500, 45 mins), Tarot Session (₹1100, 30 mins), Vastu Analysis (₹5100, 90 mins)
- For personal readings, suggest booking with Pooja
- For orders/shipping questions, direct to WhatsApp: +91 7042620928

Remember: You're helpful but human. Talk like you're chatting with someone, not giving a presentation.`;

export const sendMessage = async (messages: ChatMessage[]): Promise<string> => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error response:', errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'I apologize, I could not generate a response.';
  } catch (error) {
    console.error('Groq API error:', error);
    throw error;
  }
};
