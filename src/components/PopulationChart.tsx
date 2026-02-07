import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { Checkpoint } from '../types';

interface PopulationChartProps {
    data: Checkpoint[];
}

export const PopulationChart: React.FC<PopulationChartProps> = ({ data }) => {
    // Only show last N points to keep performance?
    // Or downsample.
    // Let's just pass data.

    return (
        <div style={{ width: '100%', height: 200, marginTop: '20px' }}>
            <ResponsiveContainer>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="tick" stroke="#888" />
                    <YAxis stroke="#888" />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#222', border: '1px solid #444' }}
                    />
                    <Line type="monotone" dataKey="grassCount" stroke="#4ade80" dot={false} strokeWidth={2} name="Grass" />
                    <Line type="monotone" dataKey="sheepCount" stroke="#ffffff" dot={false} strokeWidth={2} name="Sheep" />
                    <Line type="monotone" dataKey="wolfCount" stroke="#ef4444" dot={false} strokeWidth={2} name="Wolf" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
