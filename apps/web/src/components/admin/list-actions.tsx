'use client';

import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ListActionsProps {
  onExport: () => void;
  exportDisabled?: boolean;
  exportLabel?: string;
}

/** Export CSV + Print buttons for a list/table page. Hidden itself when printing (via print:hidden) — printing a page shows only its Cards/Tables, since the admin shell already hides the sidebar/header on print. */
export function ListActions({ onExport, exportDisabled, exportLabel = 'Export CSV' }: ListActionsProps) {
  return (
    <div className="flex items-center gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={onExport} disabled={exportDisabled}>
        <Download className="h-4 w-4" /> {exportLabel}
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Print
      </Button>
    </div>
  );
}
