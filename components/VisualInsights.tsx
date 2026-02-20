
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  concepts: Array<{ title: string, importance: number }>;
}

const VisualInsights: React.FC<Props> = ({ concepts }) => {
  const data = concepts.map(c => ({
    subject: c.title,
    A: c.importance,
    fullMark: 100,
  }));

  return (
    <div className="h-[300px] w-full bg-slate-900/50 rounded-xl p-4 border border-slate-800">
      <h3 className="text-sm font-semibold text-slate-400 mb-4 uppercase tracking-wider">Concept Density Matrix</h3>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Book Impact"
            dataKey="A"
            stroke="#818cf8"
            fill="#818cf8"
            fillOpacity={0.6}
          />
          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default VisualInsights;
