"use server"

import { createClient } from "@/lib/supabase/server";
import { prompts } from "@/prompts/prompts";

type idea = {
    id: string;
    idea: string;
    description: string;
    evaluation: string;
}

type ideaRanking = {
    id: string;
    idea: string;
    description: string;
    evaluation: string;
    ranking: string;
}

type ideaGeneration = {
    ideas: idea[];
}

type ideaSchema = {
    purpose: string;
    context: string;
    criteria: string[];
    constraints: string[];
}

type ideaRankingGeneration = {
    ideas: ideaRanking[];
}



export async function initialSchemaGeneration(purpose: string, criteria: string) {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.getUser();
    if (error) {
        throw new Error(error.message);
    }
    if (!data.user) {
        throw new Error('User not found');
    }

    const userPrompt = prompts.initialSchemaGeneration.userPrompt.replace('{{.context}}', purpose).replace('{{.request}}', criteria).replace('{{.preferences}}', criteria).replace('{{.criteria}}', criteria);

    const systemPrompt = prompts.initialSchemaGeneration.systemPrompt;
    
    const response = await supabase.functions.invoke('chatCompletionModel', {
        body: {
            systemPrompt: systemPrompt,
            userPrompt: userPrompt,
            model: "4.0-mini",
            temperature: 1,
        }
    });
    if (response.error) {
        throw new Error(response.error.message);
    }
    return response.data;
}




export async function refineSchemaBasedOnFeedback(feedback: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ideas').insert({ feedback }).select();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export async function refineSchemaBasedOnIdeaPreferences(preferences: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ideas').insert({ preferences }).select();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export async function initialIdeaGeneration(purpose: string, preferences: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ideas').insert({ purpose, preferences }).select();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export async function ideaEvaluation(purpose: string, preferences: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ideas').insert({ purpose, preferences }).select();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}


export async function ideaGeneration(purpose: string, preferences: string) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('ideas').insert({ purpose, preferences }).select();
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

