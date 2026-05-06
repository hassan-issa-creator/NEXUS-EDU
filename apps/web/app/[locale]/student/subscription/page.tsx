'use client';

import { SubscriptionCard } from '@/components/payment/subscription-card';

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
        <p className="text-muted-foreground">Unlock unlimited access to all courses and AI features.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <SubscriptionCard 
          title="Monthly Plan" 
          price={29} 
          description="Billed monthly. Cancel anytime." 
        />
        <SubscriptionCard 
          title="Yearly Plan" 
          price={290} 
          description="Billed annually. Save 2 months!" 
        />
      </div>
    </div>
  );
}
