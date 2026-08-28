'use client';

import ReactECharts from 'echarts-for-react';
import { formatPrice } from '../lib/utils';
import { useMemo } from 'react';

export default function PriceChart({ data }: { data: any[] }) {
  const options = useMemo(() => {
    return {
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderColor: '#e2e8f0',
        textStyle: { color: '#0f172a' },
        formatter: (params: any) => {
          let res = `<div class="font-bold mb-1">${params[0].name}</div>`;
          params.forEach((param: any) => {
            res += `<div class="flex items-center gap-2">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background-color:${param.color};"></span>
              <span class="text-sm text-slate-700">${param.seriesName}: </span>
              <span class="font-semibold text-slate-900">${formatPrice(param.value)}/sqft</span>
            </div>`;
          });
          return res;
        }
      },
      legend: {
        data: ['Mumbai', 'Pune'],
        icon: 'circle',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#475569', fontSize: 12 },
        bottom: 0
      },
      grid: {
        top: 20,
        right: 20,
        bottom: 30,
        left: 50,
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: data.map(d => d.name),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#64748b', fontSize: 12, margin: 12 }
      },
      yAxis: {
        type: 'value',
        splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } },
        axisLabel: {
          color: '#64748b',
          fontSize: 12,
          formatter: (val: number) => `₹${val / 1000}k`
        }
      },
      series: [
        {
          name: 'Mumbai',
          type: 'line',
          data: data.map(d => d.Mumbai),
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3, color: '#3b82f6' },
          itemStyle: { color: '#3b82f6' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(59,130,246,0.3)' },
                { offset: 1, color: 'rgba(59,130,246,0)' }
              ]
            }
          }
        },
        {
          name: 'Pune',
          type: 'line',
          data: data.map(d => d.Pune),
          smooth: true,
          symbol: 'none',
          lineStyle: { width: 3, color: '#10b981' },
          itemStyle: { color: '#10b981' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(16,185,129,0.3)' },
                { offset: 1, color: 'rgba(16,185,129,0)' }
              ]
            }
          }
        }
      ]
    };
  }, [data]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <ReactECharts 
        option={options} 
        style={{ height: '100%', width: '100%', minHeight: '300px' }} 
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}