'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import IdeationCanvas from '@/components/ideating/IdeationCanvas';
import { presets } from '@/data/constants';

function IdeatingContent() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');
  
  // Find the selected template
  const selectedTemplate = templateId ? presets.find(preset => preset.id === templateId) : null;

  return (
    <div className="fixed inset-0 md:top-18 top-16">
      <IdeationCanvas selectedTemplate={selectedTemplate} />
    </div>
  );
}

export default function Ideating() {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 md:top-18 top-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
          <p className="text-sub-foreground">Loading ideation canvas...</p>
        </div>
      </div>
    }>
      <IdeatingContent />
    </Suspense>
  );
}
