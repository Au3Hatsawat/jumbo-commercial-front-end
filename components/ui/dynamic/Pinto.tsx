'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { AnalyticStat } from '@/components/ui/AnalyticStat';

export interface StatCardData {
    id: string | number;
    title: string;
    value: string;
    icon: LucideIcon;
    theme: 'blue' | 'emerald' | 'amber' | 'red' | 'gray';
    subText?: React.ReactNode;
}

interface PintoProps {
    cards: StatCardData[];
}

export const Pinto: React.FC<PintoProps> = ({ cards }) => {
    if (!cards || cards.length === 0) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {cards.map((card) => (
                <AnalyticStat
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    theme={card.theme}
                    subText={card.subText}
                />
            ))}
        </div>
    );
};

export default Pinto;