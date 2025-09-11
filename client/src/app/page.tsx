"use client";

import { presets } from "@/app/data/constants";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Home() {
  return (
    <div>
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6">
            Transform Your <span className="text-accent">Purpose</span> Into 
            <br />
            <span className="text-accent">50+ Actionable Ideas</span>
          </h2>
          <p className="text-xl text-sub-foreground mb-8 max-w-2xl mx-auto">
            AI-powered ideation that learns your preferences, scores ideas intelligently, 
            and helps you discover breakthrough solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => {}}
              disabled={false}
              className="text-lg px-8 py-6"
            >
              Start Fresh Ideation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => {}}
              className="text-lg px-8 py-6"
            >
              View Past Runs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-card/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Quick Start Templates
            </h3>
            <p className="text-lg text-sub-foreground max-w-2xl mx-auto">
              Jump-start your ideation with pre-configured templates optimized for common scenarios.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presets.map((preset) => (
              <Card key={preset.id} className="card-hover group cursor-pointer" onClick={() => {}}>
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
                
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Purpose:</p>
                      <p className="text-xs text-sub-foreground">{preset.purpose}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">Criteria Weights:</p>
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {Object.entries(preset.criteria).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-sub-foreground capitalize">{key}:</span>
                            <span className="text-accent font-medium">{Math.round(value * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-4 group-hover:bg-accent/90 transition-colors"
                    disabled={false}
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

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold text-foreground mb-8">
            How It Works
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-accent font-bold">1</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground">Define Purpose</h4>
              <p className="text-sm text-sub-foreground">
                Start with your goal and context. Our AI understands what you're trying to achieve.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-accent font-bold">2</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground">AI Generation</h4>
              <p className="text-sm text-sub-foreground">
                Get 50+ diverse, scored ideas tailored to your criteria and context.
              </p>
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto">
                <span className="text-accent font-bold">3</span>
              </div>
              <h4 className="text-lg font-semibold text-foreground">Learn & Refine</h4>
              <p className="text-sm text-sub-foreground">
                Rank ideas to teach our AI your preferences for even better future suggestions.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}