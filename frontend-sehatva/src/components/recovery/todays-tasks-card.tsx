"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { cn } from "@/lib/utils";

export function TodaysTasksCard() {
  const { tasks, toggleTask } = useAppStore();

  return (
    <Card>
      <CardBody>
        <p className="text-[15px] font-bold text-ink-900">Today&rsquo;s Tasks</p>
        <ul className="mt-3 flex flex-col gap-2.5">
          {tasks.map((task) => (
            <li key={task.id}>
              <button
                onClick={() => toggleTask(task.id)}
                className="focus-ring flex w-full items-center justify-between gap-2 text-left"
              >
                <span className={cn("text-sm", task.done ? "text-ink-500 line-through" : "text-ink-900")}>
                  {task.label}
                </span>
                {task.done ? (
                  <CheckCircle2 className="h-[18px] w-[18px] shrink-0 text-accent-green" />
                ) : (
                  <Circle className="h-[18px] w-[18px] shrink-0 text-ink-300" />
                )}
              </button>
            </li>
          ))}
        </ul>
        <a href="#roadmap-timeline" className="focus-ring mt-3 inline-block text-xs font-semibold text-brand-600 hover:underline">
          View All Tasks
        </a>
      </CardBody>
    </Card>
  );
}
