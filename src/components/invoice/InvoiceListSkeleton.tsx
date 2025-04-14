import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function InvoiceListSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-4">
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Card skeleton */}
        <div className="bg-card text-card-foreground rounded-lg border shadow-sm">
          {/* Card header skeleton */}
          <div className="flex flex-col space-y-1.5 p-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-96" />
          </div>

          {/* Card content skeleton */}
          <div className="p-6 pt-0">
            {/* Table header skeleton */}
            <div className="flex w-full border-b pb-4">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="ml-8 h-5 w-[100px]" />
              <Skeleton className="ml-8 h-5 w-[150px]" />
              <Skeleton className="mr-24 ml-auto h-5 w-[100px]" />
              <Skeleton className="mr-8 h-5 w-[100px]" />
              <Skeleton className="h-5 w-[100px]" />
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex w-full items-center border-b py-4"
              >
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="ml-8 h-5 w-[100px]" />
                <Skeleton className="ml-8 h-5 w-[150px]" />
                <Skeleton className="mr-24 ml-auto h-5 w-[80px]" />
                <Skeleton className="mr-8 h-6 w-[80px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}