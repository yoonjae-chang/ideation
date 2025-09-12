
export const prompts = {
    

    initialSchemaGeneration: {
        systemPrompt: `
        You are an extremely useful and helpful assistant that helps users generate a personalized schemas for amazing idea generation and rapid prototyping for a specific purpose and context. The schema defines the purpose, preferences and criteria for success of the ideas. ONLY RETURN THE SCHEMA in JSON format, NO OTHER TEXT.
`,
        userPrompt: `
        
        You will be given a description of the context, purpose, and preferences for idea generation and rapid prototyping. Your job is to generate a schema that defines the context, purpose, preferences and constraints for success of the ideas. YOU MAY EDIT and INFER some of the context, purpose, preferences and constraints to make them more specific and detailed. Do not limit the scope of criteria and constraints verbatim from the preferences and use your best discernment to generate the criteria and constraints from the preferences in relation to the context and purpose that will be used to generate the an extremely high quality and extremely wide range of ideas.

        This is the user's description of context for idea generation and rapid prototyping:
        {{.context}}

        This is the user's description of purpose for idea generation and rapid prototyping:
        {{.purpose}}

        This is the user's description of preferences for success of the ideas:
        {{.preferences}}


        Return only in this format. YOU MAY EDIT and INFER some of the context, purpose, preferences and constraints to make them more specific and detailed. Example output:
        {
            "purpose": "To generate ideas for a specific purpose",
            "context": "The context of the user's goal for idea generation and rapid prototyping",
            "criteria": [
                "Extremely creative and innovative",
                "Highly scalable",
                "Highly profitable"
            ],
            "constraints": [
                "Relatively feasible to implement for my company",
                "No traditional billboard ads"
            ]
        }
        `,
        maxTokens: 8000,
    },
    
    // refineSchemaBasedOnFeedback: {
    //     systemPrompt: `You are an intelligent assistant that helps users refine a schema for amazing idea generation and rapid prototyping. The schema defines the purpose, preferences and criteria for success of the ideas. ONLY RETURN THE SCHEMA in JSON format, NO OTHER TEXT. DO NOT CHANGE THE PURPOSE`,
    //     userPrompt: `
        
    //     `,
    //     maxTokens: 4000,
    // },

    refineSchemaBasedOnIdeaPreferences: {
        systemPrompt: `You are the best idea generation and rapid prototyping assistant in the world who expertly understands the ins and outs of idea generation and rapid prototyping. You are given a schema that defines the purpose, preferences and criteria for success of the ideas. Your job is to refine the schema based on the user's rankings for the success of the ideas. ONLY RETURN THE SCHEMA in JSON format, NO OTHER TEXT. DO NOT CHANGE THE PURPOSE AND CONTEXT`,
        userPrompt: `
        Please refine the schema based on the user's rankings for the success of these ideas. Extract the features of the ideas that are most highly ranked by the user and incorporate them to the schema. Try to understand the user's preferences and incorporate them to the schema.

        This is the user's schema:
        {{.schema}}

        The format of the schema is:
        {
            "purpose": "To generate ideas for a specific purpose",
            "context": "The context of the user's goal for idea generation and rapid prototyping",
            "criteria": [
                "Extremely creative and innovative",
                "Highly scalable",
                "Highly profitable",
                ...
            ],
            "constraints": [
                "Relatively feasible to implement for my company",
                "No traditional billboard ads"
            ]
        }

        This is the user's rankings for the success of the ideas:
        {{.rankings}}


        The idea and description are the user's ideas and descriptions of the ideas that are most highly ranked by the user. The ranking is a number between 1 and 5 that represents the user's ranking for the success of the idea. 1 is the lowest and 5 is the highest.

        The format of the rankings is:
        [
        {
            "idea": "Idea 1",
            "description": "An idea that is extremely creative and innovative",
            "ranking": "5",
        },
        {
            "idea": "An idea that isn't scalable and scalable",
            "description": "An idea that isn't scalable and scalable",
            "ranking": "2",
        },
        ...
        ]

        Now add onto or modify the schema based on the user's rankings for the success of the ideas and their descriptions. Add the ideas that are rated 5 stars to the successful_ideas and add all the ideas to the past_ideas. DO NOT REPEAT THE IDEAS THAT ARE ALREADY IN THE successful_ideas OR past_ideas. ONLY RETURN THE SCHEMA in the JSON format below, NO OTHER TEXT. DO NOT CHANGE THE PURPOSE or CONTEXT repeat them verbatim:
        {
            "purpose": "To generate ideas for a specific purpose",
            "context": "The context of the user's goal for idea generation and rapid prototyping",
            "criteria": [
                "Extremely creative and innovative",
                "Highly scalable",
                "Highly profitable",
                ...
            ],
            "constraints": [
                "Relatively feasible to implement for my company",
                "No traditional billboard ads"
            ],
            "successful_ideas": [
                "Idea 1",
                "Idea 2",
                ...
            ],
            "past_ideas": [
                "Idea 1",
                "Idea 2",
                ...
            ],
        }

        `,
        maxTokens: 8000,
    },


    

    ideaGeneration: {
        systemPrompt: `You are the best idea generation and rapid prototyping assistant in the world who expertly understands the ins and outs of idea generation and rapid prototyping. You are given a schema that defines the purpose, preferences and criteria for success of the ideas. Your job is to generate ideas that are extremely high quality and extremely wide range of ideas. ONLY RETURN THE IDEAS in JSON format, NO OTHER TEXT.`,
        userPrompt: `
        Please generate ideas that are extremely high quality and extremely wide range of ideas.

        This is the user's schema:
        {{.schema}}

        The format of the schema is:
        {
            "purpose": "To generate ideas for a specific purpose",
            "context": "The context of the user's goal for idea generation and rapid prototyping",
            "criteria": [
                "Extremely creative and innovative",
                "Highly scalable",
                "Highly profitable",
                ...
            ],
            "constraints": [
                "Relatively feasible to implement for my company",
                "No traditional billboard ads"
            ],
            "successful_examples": [
                "Idea 1",
                "Idea 2",
                ...
            ],
            "past_ideas": [
                "Idea 1",
                "Idea 2",
                ...
            ],
        }

        Now generate 30 different ideas that are extremely high quality and extremely wide range of ideas. Use the schema as a guide to generate the ideas; however, do not limit the scope of the ideas to the schem and use your best discernment to generate the ideas. The purpose and context should be regarded as more important than the criteria and constraints. Use the successful_ideas as inspiration for new ideas but do not limit the scope of the ideas to solely the successful_ideas use your best discernment and expertise in protyping and ideation to generate the ideas. Also, do not repeat the ideas (however ideas that are similar but differet to the successful_ideas are fine) that are already in the past_ideas. ONLY RETURN THE IDEAS in the JSON format below, NO OTHER TEXT:
        {
            "ideas":
                [
                    {
                        "idea": "Idea 1",
                        "description": "An idea that is extremely creative and innovative",
                    },
                    ...
                ]
        }
        `,
        maxTokens: 8000,
    },

    ideaEvaluation: {
        systemPrompt: `You are the best idea generation and rapid prototyping assistant in the world who expertly understands the ins and outs of idea generation and rapid prototyping. You are given a schema that defines the purpose, preferences and criteria for success of the ideas. Your job is to evaluate the ideas based on the schema and the user's preferences. ONLY RETURN THE EVALUATION in JSON format, NO OTHER TEXT. DO NOT CHANGE THE PURPOSE`,
        userPrompt: `
        Please evaluate the ideas based on the schema. You will be given a list of ideas and their descriptions. You will need to evaluate the ideas based on the schema and the user's preferences.

        This is the user's schema:
        {{.schema}}
        
        The format of the schema is:
        {
            "purpose": "To generate ideas for a specific purpose",
            "context": "The context of the user's goal for idea generation and rapid prototyping",
            "criteria": [
                "Extremely creative and innovative",
                "Highly scalable",
                "Highly profitable",
                ...
            ],
            "constraints": [
                "Relatively feasible to implement for my company",
                "No traditional billboard ads"
            ],
            "successful_ideas": [
                "Idea 1",
                "Idea 2",
                ...
            ],
            "past_ideas": [
                "Idea 1",
                "Idea 2",
                ...
            ],
        }

        This is the list of ideas and their descriptions:
        {{.ideas}}

        The format of the ideas is:
        {
            "ideas":
                [
                    {
                        "idea": "Idea 1",
                        "description": "An idea that is extremely creative and innovative",
                    },
                    ...
                ]
        }

        Now evaluate the ideas based on the schema and the user's preferences. ONLY RETURN THE top 10 IDEAS that are extremely high quality using your expert judgement and also meet the purpose and context of the user's goal for idea generation and rapid prototyping along with the criteria and constraints. MAKE SURE THE IDEAS ARE REPEATED VERBATIM FROM THE LIST OF IDEAS. EVALUATE HOLISTICALLY and don't be bias towards order. Do not repeat the ideas (however ideas that are similar but differet to the successful_ideas are fine) that are already in the successful_ideas or past_ideas.

        in the JSON format below, NO OTHER TEXT. DO NOT CHANGE THE PURPOSE:
        {
        "ideas":[
            {
                "idea": "Idea 1",
                "description": "An idea that is extremely creative and innovative",
                "evaluation": "90",
            },
            ...
        ]}
        `,
        maxTokens: 8000,
    },

    // refineIdeaBasedOnPreferences: {
    //     systemPrompt: ``,
    //     userPrompt: ``,
    //     maxTokens: 4000,
    // },

    

    
    // chatWithIdea: {
    //     systemPrompt: ``,
    //     userPrompt: ``,
    //     maxTokens: 4000,
    // },
    
    



}