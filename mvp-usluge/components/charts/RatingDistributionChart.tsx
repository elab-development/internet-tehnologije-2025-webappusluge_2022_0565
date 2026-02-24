'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

interface RatingDistributionChartProps {
    data: Array<{
        rating: string;
        count: number;
    }>;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'];

export default function RatingDistributionChart({ data }: RatingDistributionChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-500">
                Nema podataka za prikaz
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                    dataKey="rating"
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
                <Bar dataKey="count" name="Broj ocena" radius={[8, 8, 0, 0]}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
