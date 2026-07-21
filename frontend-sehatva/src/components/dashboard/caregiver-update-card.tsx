"use client";

import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";

export function CaregiverUpdateCard() {
  const { caregivers, dashboardStats } = useAppStore();
  const primary = caregivers[0];
  const initials = primary
    ? primary.name.split(" ").map((p) => p[0]).join("")
    : "--";
  const missed = dashboardStats?.missedMedicinesCount ?? 0;

  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <p className="text-[15px] font-bold text-ink-900">Caregiver Update</p>
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">
            {initials}
          </span>
          <div>
            <p className="text-sm font-semibold text-ink-900">{caregivers.length} Caregiver{caregivers.length === 1 ? "" : "s"}</p>
            <p className="text-xs text-ink-500">{caregivers.length > 0 ? "Connected" : "None added yet"}</p>
          </div>
        </div>
        <span
          className={
            missed === 0
              ? "w-fit rounded-full bg-accent-greenSoft px-3 py-1 text-xs font-semibold text-accent-green"
              : "w-fit rounded-full bg-accent-orangeSoft px-3 py-1 text-xs font-semibold text-accent-orange"
          }
        >
          {missed === 0 ? "All Good" : `${missed} missed dose${missed === 1 ? "" : "s"}`}
        </span>
        <Link href="/caregiver" className="focus-ring self-start text-xs font-semibold text-brand-600 hover:underline">
          View Details
        </Link>
      </CardBody>
    </Card>
  );
}
