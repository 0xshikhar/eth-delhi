"use client";

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// Color palette for charts
const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
  indigo: '#6366f1',
  teal: '#14b8a6'
};

const CHART_COLORS = [
  COLORS.primary,
  COLORS.secondary,
  COLORS.accent,
  COLORS.purple,
  COLORS.pink,
  COLORS.indigo,
  COLORS.teal,
  COLORS.danger
];

interface ChartWrapperProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    label: string;
  };
}

function ChartWrapper({ title, description, children, className, trend }: ChartWrapperProps) {
  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    if (trend.value > 0) return 'text-green-600';
    if (trend.value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {trend && (
            <div className="flex items-center gap-2">
              {getTrendIcon()}
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface DataDistributionChartProps {
  data: Array<{ name: string; value: number; }>;
  title: string;
  description?: string;
  type?: 'bar' | 'pie';
}

export function DataDistributionChart({ 
  data, 
  title, 
  description, 
  type = 'bar' 
}: DataDistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  if (type === 'pie') {
    return (
      <ChartWrapper title={title} description={description}>
        <div className="flex items-center gap-6">
          <ResponsiveContainer width="60%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(props: any) => `${props.name} ${(props.percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium">{item.value.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">
                    {((item.value / total) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartWrapper>
    );
  }

  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface TimeSeriesChartProps {
  data: Array<{ date: string; value: number; [key: string]: any; }>;
  title: string;
  description?: string;
  dataKey?: string;
  type?: 'line' | 'area';
  trend?: { value: number; label: string; };
}

export function TimeSeriesChart({ 
  data, 
  title, 
  description, 
  dataKey = 'value',
  type = 'line',
  trend
}: TimeSeriesChartProps) {
  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <ChartWrapper title={title} description={description} trend={trend}>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <DataComponent 
            type="monotone" 
            dataKey={dataKey} 
            stroke={COLORS.primary}
            fill={type === 'area' ? COLORS.primary : undefined}
            strokeWidth={2}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface MultiSeriesChartProps {
  data: Array<Record<string, any>>;
  title: string;
  description?: string;
  series: Array<{ key: string; name: string; color?: string; }>;
  xAxisKey: string;
}

export function MultiSeriesChart({ 
  data, 
  title, 
  description, 
  series, 
  xAxisKey 
}: MultiSeriesChartProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          {series.map((s, index) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color || CHART_COLORS[index % CHART_COLORS.length]}
              strokeWidth={2}
              name={s.name}
              dot={{ strokeWidth: 2, r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface ScatterPlotProps {
  data: Array<{ x: number; y: number; name?: string; category?: string; }>;
  title: string;
  description?: string;
  xLabel?: string;
  yLabel?: string;
}

export function ScatterPlot({ 
  data, 
  title, 
  description, 
  xLabel = 'X Axis',
  yLabel = 'Y Axis'
}: ScatterPlotProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" dataKey="x" name={xLabel} />
          <YAxis type="number" dataKey="y" name={yLabel} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter dataKey="y" fill={COLORS.primary} />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface QualityRadarProps {
  data: Array<{ metric: string; value: number; fullMark: number; }>;
  title: string;
  description?: string;
}

export function QualityRadarChart({ data, title, description }: QualityRadarProps) {
  return (
    <ChartWrapper title={title} description={description}>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={90} domain={[0, 100]} />
          <Radar
            name="Quality Score"
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Tooltip />
        </RadarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

interface DataQualityMetricsProps {
  metrics: {
    completeness: number;
    accuracy: number;
    consistency: number;
    validity: number;
    uniqueness: number;
  };
}

export function DataQualityMetrics({ metrics }: DataQualityMetricsProps) {
  const radarData = [
    { metric: 'Completeness', value: metrics.completeness, fullMark: 100 },
    { metric: 'Accuracy', value: metrics.accuracy, fullMark: 100 },
    { metric: 'Consistency', value: metrics.consistency, fullMark: 100 },
    { metric: 'Validity', value: metrics.validity, fullMark: 100 },
    { metric: 'Uniqueness', value: metrics.uniqueness, fullMark: 100 },
  ];

  const overallScore = Object.values(metrics).reduce((sum, val) => sum + val, 0) / 5;
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-blue-600 bg-blue-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QualityRadarChart 
        data={radarData}
        title="Data Quality Overview"
        description="Comprehensive quality assessment across multiple dimensions"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Quality Metrics</CardTitle>
          <CardDescription>Individual quality scores and overall assessment</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold text-gray-900">{overallScore.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Overall Quality Score</div>
            <Badge className={`mt-2 ${getScoreColor(overallScore)}`}>
              {overallScore >= 90 ? 'Excellent' : 
               overallScore >= 75 ? 'Good' : 
               overallScore >= 60 ? 'Fair' : 'Needs Improvement'}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {Object.entries(metrics).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{value}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface DatasetStatsProps {
  stats: {
    totalRows: number;
    totalColumns: number;
    dataTypes: Record<string, number>;
    nullValues: number;
    duplicateRows: number;
    fileSize: string;
  };
}

export function DatasetStats({ stats }: DatasetStatsProps) {
  const dataTypeData = Object.entries(stats.dataTypes).map(([type, count]) => ({
    name: type,
    value: count
  }));

  const completenessRate = ((stats.totalRows * stats.totalColumns - stats.nullValues) / (stats.totalRows * stats.totalColumns)) * 100;
  const uniquenessRate = ((stats.totalRows - stats.duplicateRows) / stats.totalRows) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DataDistributionChart
        data={dataTypeData}
        title="Data Types Distribution"
        description="Distribution of column data types in the dataset"
        type="pie"
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Dataset Statistics</CardTitle>
          <CardDescription>Key metrics and data quality indicators</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalRows.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total Rows</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.totalColumns}</div>
              <div className="text-sm text-muted-foreground">Columns</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Completeness</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${completenessRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{completenessRate.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Uniqueness</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${uniquenessRate}%` }}
                  />
                </div>
                <span className="text-sm font-medium">{uniquenessRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
          
          <div className="pt-3 border-t">
            <div className="flex justify-between text-sm">
              <span>File Size:</span>
              <span className="font-medium">{stats.fileSize}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Null Values:</span>
              <span className="font-medium">{stats.nullValues.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duplicate Rows:</span>
              <span className="font-medium">{stats.duplicateRows.toLocaleString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}