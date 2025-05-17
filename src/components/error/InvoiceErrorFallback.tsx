"use client";

import React from "react";
import type { FallbackProps } from "react-error-boundary";
import { TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/server/api/root";

export function InvoiceErrorFallback({
  error,
  resetErrorBoundary,
}: FallbackProps): React.ReactElement {
  console.error("Error caught by ErrorBoundary:", error); // For debugging

  if (isTRPCError(error)) {
    switch (error.data?.code) {
      case "NOT_FOUND":
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Invoice Not Found</h2>
            <p>
              {error.message ||
                "The invoice you are looking for does not exist or you do not have permission to view it."}
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        );
      case "UNAUTHORIZED":
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Unauthorized</h2>
            <p>
              {error.message ||
                "You do not have permission to view this invoice."}
            </p>
            <button
              onClick={() => (window.location.href = "/dashboard")}
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        );
      // Add other specific TRPC error codes as needed
      default:
        return (
          <div
            role="alert"
            className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
          >
            <h2 className="font-bold">Error Loading Invoice</h2>
            <p>
              {error.message ||
                "An unexpected error occurred while trying to load the invoice."}
            </p>
            <button
              onClick={resetErrorBoundary}
              className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Try again
            </button>
          </div>
        );
    }
  }

  // Fallback for non-TRPC errors or other unexpected errors
  return (
    <div
      role="alert"
      className="rounded border border-red-400 bg-red-100 p-4 text-red-700"
    >
      <h2 className="font-bold">An Unexpected Error Occurred</h2>
      <p>{error instanceof Error ? error.message : "Something went wrong."}</p>
      <button
        onClick={resetErrorBoundary}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </div>
  );
}

export function isTRPCError(
  cause: unknown,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError;
}
