'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { useEffect, useRef } from 'react';
import { FiTrendingUp } from 'react-icons/fi';

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  Legend
);

interface TrendPoint {
  data: string; // YYYY-MM-DD
  vendas: number;
  total: number; // valor (R$)
}

interface SalesTrendChartProps {
  points: TrendPoint[];
  loading?: boolean;
}

export default function SalesTrendChart({ points = [], loading }: SalesTrendChartProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || loading) return;

    const labels = points.map((p) => p.data.slice(5)); // MM-DD
    const datasetValues = points.map((p) => p.total);

    if (chartRef.current) {
      chartRef.current.data.labels = labels;
      chartRef.current.data.datasets[0].data = datasetValues;
      chartRef.current.update();
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Gradiente brand
    const gradient = ctx.createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(37,50,135,0.35)');
    gradient.addColorStop(1, 'rgba(37,50,135,0.02)');

    chartRef.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Receita (R$)',
            data: datasetValues,
            tension: 0.35,
            fill: true,
            backgroundColor: gradient,
            borderColor: '#253287',
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#FEA800',
            pointBorderColor: '#253287',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' as const },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(Number(ctx.parsed.y || 0)),
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#4b5563', font: { family: 'inherit' } },
          },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              color: '#4b5563',
              callback: (value) =>
                new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                  maximumFractionDigits: 0,
                }).format(Number(value)),
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [points, loading]);

  return (
    <Card className='shadow-lg border-0 h-100'>
      <CardHeader className='bg-gradient-to-r from-[#253287] to-[#3141a8] text-white rounded-top'>
        <CardTitle className='d-flex align-items-center justify-content-between w-100 text-white'>
          <span className='d-flex align-items-center'>
            <FiTrendingUp className='me-2' /> Evolução (14 dias)
          </span>
          {!loading && points.length > 0 && (
            <span className='badge bg-light text-dark fw-medium'>
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(points.reduce((acc, p) => acc + p.total, 0))}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className='p-4'>
        <div style={{ height: 320 }} className='w-100 position-relative'>
          {loading ? (
            <div className='d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted'>
              <div className='spinner-border text-primary mb-3' role='status' />
              <small>Carregando série de vendas...</small>
            </div>
          ) : points.length === 0 ? (
            <div className='d-flex flex-column align-items-center justify-content-center h-100 text-center text-muted'>
              <small>Nenhuma venda nos últimos dias.</small>
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              aria-label='Gráfico de tendência de vendas'
              className='w-100 h-100'
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
