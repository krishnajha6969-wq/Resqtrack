'use client';

import { useEffect, useRef } from 'react';

/**
 * Chart.js wrapper components for analytics
 * Uses dynamic import to avoid SSR issues
 */

export function BarChart({ data, options = {}, height = 300 }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            if (!mounted || !canvasRef.current) return;
            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(canvasRef.current, {
                type: 'bar',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', font: { family: 'Inter' } },
                        },
                    },
                    scales: {
                        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                        y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                    },
                    ...options,
                },
            });
        };

        loadChart();
        return () => { mounted = false; if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);

    return <canvas ref={canvasRef} height={height} />;
}

export function DoughnutChart({ data, options = {}, height = 300 }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            if (!mounted || !canvasRef.current) return;
            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(canvasRef.current, {
                type: 'doughnut',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#94a3b8', font: { family: 'Inter' }, padding: 16 },
                        },
                    },
                    ...options,
                },
            });
        };

        loadChart();
        return () => { mounted = false; if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);

    return <canvas ref={canvasRef} height={height} />;
}

export function LineChart({ data, options = {}, height = 300 }) {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        let mounted = true;

        const loadChart = async () => {
            const { Chart, registerables } = await import('chart.js');
            Chart.register(...registerables);

            if (!mounted || !canvasRef.current) return;
            if (chartRef.current) chartRef.current.destroy();

            chartRef.current = new Chart(canvasRef.current, {
                type: 'line',
                data,
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#94a3b8', font: { family: 'Inter' } },
                        },
                    },
                    scales: {
                        x: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                        y: { ticks: { color: '#64748b' }, grid: { color: '#1e293b' } },
                    },
                    ...options,
                },
            });
        };

        loadChart();
        return () => { mounted = false; if (chartRef.current) chartRef.current.destroy(); };
    }, [data]);

    return <canvas ref={canvasRef} height={height} />;
}
