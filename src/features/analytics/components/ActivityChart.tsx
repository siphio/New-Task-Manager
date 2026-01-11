import { Line, LineChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/shared/components/ui/chart';
import { DayActivity } from '@/shared/types';

interface ActivityChartProps {
  data: DayActivity[];
}

const chartConfig = {
  count: {
    label: 'Tasks',
    color: '#a5b4fc',
  },
} satisfies ChartConfig;

export function ActivityChart({ data }: ActivityChartProps) {
  return (
    <div className="bg-[#222830] rounded-2xl p-4">
      <h2 className="text-lg font-semibold text-foreground mb-4">Activity</h2>
      <ChartContainer config={chartConfig} className="h-[180px] w-full">
        <LineChart data={data} accessibilityLayer margin={{ top: 20, right: 12, bottom: 0, left: 12 }}>
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#484F58', fontSize: 12 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis hide />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ stroke: '#3a3f4b' }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#a5b4fc"
            strokeWidth={2}
            dot={{
              fill: '#a5b4fc',
              stroke: '#a5b4fc',
              strokeWidth: 2,
              r: 4,
            }}
            activeDot={{
              fill: '#a5b4fc',
              stroke: '#ffffff',
              strokeWidth: 2,
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
}
