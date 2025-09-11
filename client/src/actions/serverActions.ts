"use server"

import { createClient } from "@/lib/supabase/server";
import { prompts } from "@/prompts/prompts";

// Type definitions
export type Idea = {
    idea: string;
    description: string;
}

export type IdeaWithEvaluation = {
    idea: string;
    evaluation: string;
}

export type IdeaRanking = {
    idea: string;
    description: string;
    ranking: string;
}

export type IdeaSchema = {
    purpose: string;
    context: string;
    criteria: Record<string, string>;
    constraints: string[];
}

// Helper function to call the chat completion model
async function callChatCompletion(
    systemPrompt: string,
    userPrompt: string,
    model: string = "gpt-4o-mini",
    temperature: number = 1
) {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
        throw new Error(userError.message);
    }
    if (!userData.user) {
        throw new Error('User not found');
    }

    for (let i = 0; i < 3; i++) {
    const response = await supabase.functions.invoke('chatCompletionModel', {
        body: {
            systemPrompt,
            userPrompt,
            model,
            temperature,
        }
    });

    if (response.error) {
        continue;
    }

        try {
            return JSON.parse(response.data.data);
        } catch (parseError) {
            continue;
        }
    }
}

/**
 * Generate initial schema based on user's context, purpose, and preferences
 */
export async function initialSchemaGeneration(
    context: string,
    purpose: string,
    preferences: string
): Promise<IdeaSchema> {
    const userPrompt = prompts.initialSchemaGeneration.userPrompt
        .replace('{{.context}}', context)
        .replace('{{.purpose}}', purpose)
        .replace('{{.preferences}}', preferences);

    const systemPrompt = prompts.initialSchemaGeneration.systemPrompt;
    
    return await callChatCompletion(systemPrompt, userPrompt, "gpt-4o-mini", 1);
}

/**
 * Refine schema based on user's idea rankings and preferences
 */
export async function refineSchemaBasedOnIdeaPreferences(
    schema: IdeaSchema,
    rankings: IdeaRanking[]
): Promise<IdeaSchema> {
    const userPrompt = prompts.refineSchemaBasedOnIdeaPreferences.userPrompt
        .replace('{{.schema}}', JSON.stringify(schema))
        .replace('{{.rankings}}', JSON.stringify(rankings));

    const systemPrompt = prompts.refineSchemaBasedOnIdeaPreferences.systemPrompt;
    
    return await callChatCompletion(systemPrompt, userPrompt, "gpt-4o-mini", 1);
}

/**
 * Generate ideas based on the schema
 */
export async function ideaGeneration(schema: IdeaSchema): Promise<Idea[]> {
    const userPrompt = prompts.ideaGeneration.userPrompt
        .replace('{{.schema}}', JSON.stringify(schema));

    const systemPrompt = prompts.ideaGeneration.systemPrompt;
    
    return await callChatCompletion(systemPrompt, userPrompt, "gpt-4o-mini", 1.3);
}

/**
 * Evaluate ideas based on the schema and return top 10 with evaluations
 */
export async function ideaEvaluation(
    schema: IdeaSchema,
    ideas: Idea[]
): Promise<IdeaWithEvaluation[]> {
    const userPrompt = prompts.ideaEvaluation.userPrompt
        .replace('{{.schema}}', JSON.stringify(schema))
        .replace('{{.ideas}}', JSON.stringify(ideas));

    const systemPrompt = prompts.ideaEvaluation.systemPrompt;
    
    return await callChatCompletion(systemPrompt, userPrompt, "gpt-4o-mini", 1);
}

