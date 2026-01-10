import { Bar, BarChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/components/ui/chart';
import { DayActivity } from '@/shared/types';

interface ActivityChartProps {
  data: DayActivity[];
}

const chartConfig = {
  count: {
    label: 'Tasks',
    color: '#0A84FF',
  },
} satisfies ChartConfig;

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="bg-background-secondary rounded-xl p-4">
      <h2 className="text-lg font-semibold text-text-primary mb-4">Activity</h2>
      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <BarChart data={data} accessibilityLayer>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#484F58', fontSize: 12 }}
          />
          <YAxis hide />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ fill: '#21262D' }}
          />
          <Bar
            dataKey="count"
            fill="#0A84FF"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
