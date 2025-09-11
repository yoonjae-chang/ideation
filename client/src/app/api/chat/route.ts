import { openai } from '@ai-sdk/openai';
import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { prompts } from '@/prompts/prompts';
import { createClient } from '@/lib/supabase/server';
// Allow streaming responses up to 30 seconds
export const maxDuration = 30;


export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: `You are an AI Ideation Assistant, a creative and intelligent companion designed to help users generate, refine, and prototype amazing ideas. Your role is to:

1. **Idea Generation**: Help brainstorm creative, innovative, and practical ideas based on user input
2. **Idea Refinement**: Improve and iterate on existing ideas, making them more feasible and impactful
3. **Prototyping Guidance**: Provide actionable steps and suggestions for turning ideas into reality
4. **Creative Problem Solving**: Approach challenges from multiple angles and suggest novel solutions

Key Principles:
- Be encouraging and supportive of all ideas, no matter how wild or simple
- Ask clarifying questions to better understand the user's goals and constraints
- Provide specific, actionable advice rather than vague suggestions
- Consider feasibility, market potential, and user needs in your responses
- Encourage experimentation and rapid prototyping
- Help users think through potential challenges and solutions

Always maintain an enthusiastic, creative, and helpful tone. Focus on being practical while encouraging bold thinking.`,
    messages: convertToModelMessages(messages),
  });

  supabase.from('chat_history').insert({
    user_id: user.id,
    message: messages,
    response: result.text,
  });

  return result.toUIMessageStreamResponse();
}

