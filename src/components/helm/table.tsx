import type { ReactNode } from "react";
import { EmptyState, TableWrap, td, th } from "./ui";

export type Col<T> = { h: string; c: (r: T) => ReactNode; className?: string };

/** Generic responsive table used by HELM list pages. */
export function DataTable<T extends { id: string | number }>({ rows, cols, empty = "Nothing here yet" }: { rows: T[]; cols: Col<T>[]; empty?: string }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <TableWrap>
      <thead><tr>{cols.map((c) => <th key={c.h} className={th}>{c.h}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r.id} className="hover:bg-accent/30">{cols.map((c) => <td key={c.h} className={`${td} ${c.className ?? ""}`}>{c.c(r)}</td>)}</tr>)}</tbody>
    </TableWrap>
  );
}
