"use client";

import { Suspense } from "react";
import { presets } from "@/data/constants";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const handleClick = (preset: { id: string }) => {
    const params = new URLSearchParams(searchParams);
    params.set('template', preset.id);
    router.push(`/ideating?${params.toString()}`);
  };


  return (
    <div className="md:pb-16 pb-7">
      <section className="py-12 px-4 sm:px-6 lg:px-8 min-h-[50vh] max-w-5xl mx-auto text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6 md:py-15 py-10">
            Prototyping <span className="text-accent">Ideas</span> Into Reality 
            <div className="text-purple-500 md:mt-4 mt-2">At The Speed Of Light</div>
          </div>
          <div className="text-[22px] text-sub-foreground mb-8 max-w-2xl mx-auto">
            AI-powered ideation and prototyping that learns your preferences, takes account of your preferences and context,
            and helps you discover breakthrough solutions.
          </div>
          
          <div className="md:mt-10 mt-5 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {router.push('/ideating');}}
              disabled={false}
              className="text-lg px-8 py-6 "
            >
              Start Idea Generation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });}}
              className="text-lg px-8 py-6 border-gray-300"
            >
              How It Works
            </Button>
          </div>
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 mt-10 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
              Quick Start Templates
            </h3>
            <p className="md:text-[20px] text-sub-foreground max-w-2xl mx-auto">
              Jump-start your ideation and prototyping with pre-configured templates optimized for common scenarios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset) => (
              <Card key={preset.id} className="card-hover group flex flex-col h-full" >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-accent/10 text-accent group-hover:bg-accent/20 transition-colors">
                      {preset.icon}
                    </div>
                    <CardTitle className="text-lg">{preset.title}</CardTitle>
                  </div>
                  <p className="text-sm text-sub-foreground">
                    {preset.description}
                  </p>
                </CardHeader>
               
                <CardContent className="flex flex-col flex-1">
                  <div className="space-y-3 flex-1">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Purpose:</p>
                      <p className="text-xs text-sub-foreground">{preset.purpose}</p>
                    </div>
                  </div>
                  <Button 
                    className="w-full group-hover:bg-accent/90 transition-colors mt-4"
                    onClick={() => {handleClick(preset);}}
                  >
                    Use This Template
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="md:py-22 py-12 px-4 sm:px-20 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <div className="text-2xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </div>
          <div className="mt-6 max-w-3xl mx-auto text-sub-foreground md:text-xl text-base ">
            Our AI-powered ideation and prototyping platform helps you generate and refine ideas quickly and efficiently by taking account of your preferences and context.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mt-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-purple-500 text-xl font-bold">1</span>
              </div>
              <h4 className="md:text-xl text-lg font-semibold text-foreground">Define Purpose and Context</h4>
              <p className="text-sm md:text-[17px] text-sub-foreground">
                Start with your goal and context. Tell us as much as you can about what you&apos;re trying to achieve and set your criteria for our AI.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-purple-500 text-xl font-bold">2</span>
              </div>
              <h4 className="md:text-xl text-lg font-semibold text-foreground">AI Ideation and Prototyping</h4>
              <div className="text-sm md:text-[17px] text-sub-foreground">
                Get X amount of diverse, scored ideas tailored to your criteria and context. We&apos;ll use your preferences to refine the ideas.
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-purple-500 text-xl font-bold">3</span>
              </div>
              <h4 className="md:text-xl text-lg font-semibold text-foreground">Refine and Iterate</h4>
              <div className="text-sm md:text-[17px] text-sub-foreground">
                Rank ideas to teach our AI your preferences for even better future suggestions. Dive deep into the ideas and refine them to your liking.
              </div>
            </div>
          </div>
        </div>
       </section>
     </div>
   );
 }

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
