import React from 'react';
import { PricingCards } from '../components/PricingCards';

export const Subscriptions = ({ isPaid, setIsPaid }) => {
  return (
    <div className="max-w-6xl mx-auto space-y-16 animate-in fade-in duration-500">
      <PricingCards isPaid={isPaid} onSelectPlan={() => setIsPaid()} embedded />
    </div>
  );
};
