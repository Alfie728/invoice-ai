"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, FileText, Users } from "lucide-react";

export function InvoiceHistory({ invoiceId }: { invoiceId: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Invoice created</p>
              <p className="text-muted-foreground text-sm">
                April 18, 2023 at 10:23 AM
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <Check className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Invoice parsed</p>
              <p className="text-muted-foreground text-sm">
                April 18, 2023 at 10:24 AM
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">Assigned for review</p>
              <p className="text-muted-foreground text-sm">
                April 18, 2023 at 11:30 AM
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
