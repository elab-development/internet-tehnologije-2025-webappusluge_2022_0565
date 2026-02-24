'use client';

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';

interface BookingsChartProps {
    data: Array<{
        month: string;
        count: number;
    }>;
}

export default function BookingsChart({ data }: BookingsChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Nema podataka za prikaz
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="month"
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <YAxis
                    stroke="#6b7280"
                    style={{ fontSize: '12px' }}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                    }}
                />
                <Legend />
                <Line
                    type="monotone"
                    dataKey="count"
                    name="Broj rezervacija"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    );
}
