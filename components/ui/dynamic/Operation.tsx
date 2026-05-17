'use client';

import React from 'react';

export interface ActionButton {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    className?: string;
}

interface OperationProps {
    actions?: ActionButton[];
}

export const Operation: React.FC<OperationProps> = ({ actions }) => {
    if (!actions || actions.length === 0) return null;

    return (
        <div className="flex items-center gap-2 flex-wrap">
            {actions.map((action, index) => (
                <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-4 py-2 rounded-lg shadow-sm flex items-center font-medium transition-colors ${
                        action.className || 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                >
                    {action.icon && <span className="mr-2">{action.icon}</span>}
                    {action.label}
                </button>
            ))}
        </div>
    );
};

export default Operation;