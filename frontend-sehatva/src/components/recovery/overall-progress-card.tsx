import { Card, CardBody } from "@/components/ui/card";

export function OverallProgressCard({ percent, day, total }: { percent: number; day: number; total: number }) {
  return (
    <Card className="border-accent-green/30 bg-accent-greenSoft">
      <CardBody className="flex items-center gap-5">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white">
          <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E7F8EE" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="15.5"
              fill="none"
              stroke="#1FAA59"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeDasharray={`${(percent / 100) * 97.4} 97.4`}
            />
          </svg>
          <span className="absolute text-sm font-bold text-accent-green">{percent}%</span>
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-ink-900">Overall Progress</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-accent-green" style={{ width: `${percent}%` }} />
          </div>
        </div>
        <p className="whitespace-nowrap text-sm font-semibold text-ink-700">
          Day {day} of {total}
        </p>
      </CardBody>
    </Card>
  );
}
