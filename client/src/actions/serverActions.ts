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

// Database persistence functions

/**
 * Save a new ideation session
 */
export async function saveIdeationSession(
    context: string,
    purpose: string,
    preferences: string
): Promise<string> {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
        throw new Error(userError.message);
    }
    if (!userData.user) {
        throw new Error('User not found');
    }

    const { data, error } = await supabase
        .from('ideation_sessions')
        .insert({
            user_id: userData.user.id,
            context,
            purpose,
            preferences
        })
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id;
}

/**
 * Load an ideation session
 */
export async function loadIdeationSession(sessionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ideation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get all user's ideation sessions
 */
export async function getUserIdeationSessions() {
    const supabase = await createClient();

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
        throw new Error(userError.message);
    }
    if (!userData.user) {
        throw new Error('User not found');
    }

    const { data, error } = await supabase
        .from('ideation_sessions')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Save a schema version
 */
export async function saveSchemaVersion(
    sessionId: string,
    schema: IdeaSchema,
    versionNumber: number
): Promise<string> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('schema_versions')
        .insert({
            session_id: sessionId,
            version_number: versionNumber,
            schema_data: schema
        })
        .select('id')
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data.id;
}

/**
 * Get schema versions for a session
 */
export async function getSchemaVersions(sessionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('schema_versions')
        .select('*')
        .eq('session_id', sessionId)
        .order('version_number', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Save ideas with rankings
 */
export async function saveIdeasWithRankings(
    sessionId: string,
    schemaVersionId: string,
    ideas: { idea: string; description?: string; evaluation?: string; ranking?: number }[]
) {
    const supabase = await createClient();

    const ideasToInsert = ideas.map(idea => ({
        session_id: sessionId,
        schema_version_id: schemaVersionId,
        idea: idea.idea,
        description: idea.description || '',
        evaluation_score: idea.evaluation || '',
        user_ranking: idea.ranking || null
    }));

    const { data, error } = await supabase
        .from('ideas')
        .insert(ideasToInsert)
        .select('*');

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Get ideas for a session
 */
export async function getSessionIdeas(sessionId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

/**
 * Update idea rankings
 */
export async function updateIdeaRankings(
    rankings: { id: string; ranking: number }[]
) {
    const supabase = await createClient();

    const updates = rankings.map(async ({ id, ranking }) => {
        const { error } = await supabase
            .from('ideas')
            .update({ user_ranking: ranking })
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    });

    await Promise.all(updates);
}
