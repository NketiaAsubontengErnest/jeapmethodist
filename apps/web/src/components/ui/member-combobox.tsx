'use client';

import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, ChevronDown, Loader2, Search, X } from 'lucide-react';
import { fetchMembers, type MemberListItem } from '@/lib/api/members';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function memberLabel(member: MemberListItem) {
  return `${member.firstName} ${member.lastName}`;
}

interface MemberComboboxProps {
  value?: string;
  /** Display label for the currently selected member — pass the name from
   *  data already on hand (e.g. an item's included `member` relation) so
   *  this component doesn't need a lookup-by-id fetch just to show it. */
  selectedLabel?: string;
  onSelect: (member: MemberListItem) => void;
  onClear?: () => void;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
}

/**
 * Searchable member picker — replaces a plain `<Select>` that dumps the
 * first 100 members into a static list (silently missing anyone beyond
 * that). Queries `/members?search=` live as the user types instead, so it
 * scales to any congregation size and actually finds who you're looking for.
 */
export function MemberCombobox({
  value,
  selectedLabel,
  onSelect,
  onClear,
  placeholder = 'Search member by name…',
  disabled,
  id,
}: MemberComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const searchQuery = useQuery({
    queryKey: ['member-combobox-search', debouncedQuery],
    queryFn: () => fetchMembers({ search: debouncedQuery, pageSize: 10 }),
    enabled: open && debouncedQuery.length > 0,
  });

  const results = searchQuery.data?.items ?? [];

  return (
    <Popover
      open={open}
      onOpenChange={(next: boolean) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          disabled={disabled}
          className={cn(
            'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          )}
        >
          <span className={cn('truncate text-left', !value && !selectedLabel && 'text-muted-foreground')}>
            {value && selectedLabel ? selectedLabel : placeholder}
          </span>
          <span className="flex shrink-0 items-center gap-1">
            {value && onClear && (
              <span
                role="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="rounded p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a name, membership no. or phone…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {debouncedQuery.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">Start typing to search members…</p>
          ) : searchQuery.isLoading ? (
            <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-muted-foreground">No members found.</p>
          ) : (
            results.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => {
                  onSelect(member);
                  setOpen(false);
                  setQuery('');
                }}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted"
              >
                <span className="min-w-0">
                  <span className="block truncate font-medium">{memberLabel(member)}</span>
                  <span className="block truncate text-xs text-muted-foreground">{member.membershipNumber}</span>
                </span>
                {value === member.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
