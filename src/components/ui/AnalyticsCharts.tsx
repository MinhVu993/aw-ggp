"use client";

import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import styles from '@/app/page.module.css';

interface ChartDataPoint {
  time: string;
  in_count: number;
  out_count: number;
}

interface AnalyticsChartsProps {
  chartData: ChartDataPoint[];
  stats: {
    total_success: number;
    today_denied: number;
  } | null;
  t: (key: string) => string;
}

const COLORS = ['#10b981', '#ef4444']; // Green for success/IN, Red for denied/OUT

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  index,
  name,
  value,
}: any) => {
  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 25) * cos;
  const my = cy + (outerRadius + 25) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 20;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={COLORS[index % COLORS.length]} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={COLORS[index % COLORS.length]} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="var(--text-primary)" style={{ fontSize: '12px', fontWeight: 600 }}>
        {name}
      </text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="var(--text-secondary)" style={{ fontSize: '11px' }}>
        {`${value} (${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

export default function AnalyticsCharts({ chartData, stats, t }: AnalyticsChartsProps) {
  
  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: t('status_success') || 'Success', value: stats.total_success },
      { name: t('status_denied') || 'Denied', value: stats.today_denied },
    ];
  }, [stats, t]);

  // Formatter cho Custom Tooltip của Line/Area Chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--glass-border)',
          borderRadius: '12px',
          padding: '1rem',
          boxShadow: 'var(--shadow-md)',
          color: 'var(--text-primary)'
        }}>
          <p style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}:</span>
              <span style={{ fontWeight: 600 }}>{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={styles.analyticsGrid}>
      {/* Area Chart - Traffic */}
      <div className={styles.chartCard} style={{ gridColumn: 'span 2' }}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{t('traffic_trend') || 'Traffic Trend'}</h3>
          <p className={styles.chartSubtitle}>{t('traffic_trend_desc') || 'IN/OUT flow across the day'}</p>
        </div>
        <div style={{ width: '100%', height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--glass-border)" />
              <XAxis 
                dataKey="time" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: 'var(--text-secondary)', paddingTop: '10px' }} />
              <Area type="monotone" name={t('in') || 'IN'} dataKey="in_count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
              <Area type="monotone" name={t('out') || 'OUT'} dataKey="out_count" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Pie Chart - Success vs Denied */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{t('auth_results') || 'Authentication Results'}</h3>
          <p className={styles.chartSubtitle}>{t('auth_results_desc') || 'Success vs Denied'}</p>
        </div>
        <div style={{ width: '100%', height: 260, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                label={renderCustomizedLabel}
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const entry = payload[0];
                    return (
                      <div style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '0.85rem 1rem',
                        boxShadow: 'var(--shadow-md)',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        pointerEvents: 'none',
                        zIndex: 100
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: entry.payload.fill || entry.color }} />
                          <span style={{ fontWeight: 700 }}>{entry.name}</span>
                        </div>
                        <div style={{ paddingLeft: '16px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {entry.value}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
                offset={40}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '30px' }} />
            </PieChart>
          </ResponsiveContainer>
          {/* Central label for Total */}
          <div style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            zIndex: 5
          }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {stats ? stats.total_success + stats.today_denied : 0}
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
              {t('total') || 'Total'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
