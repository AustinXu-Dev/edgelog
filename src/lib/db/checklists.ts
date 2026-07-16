import { createServerClient } from '../supabase/server';
import type { Checklist, ChecklistWithItems } from '../types';

export async function getChecklistsWithItems(): Promise<ChecklistWithItems[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('checklists')
    .select('*, items:checklist_items(*)')
    .eq('user_id', user.id)
    .order('sort_order')
    .order('session_time');

  return (data ?? []).map((c) => ({
    ...c,
    items: (c.items ?? []).sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order),
  })) as ChecklistWithItems[];
}

export async function getCompletionsForDate(date: string): Promise<Set<string>> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new Set();

  const { data } = await supabase
    .from('checklist_completions')
    .select('item_id')
    .eq('user_id', user.id)
    .eq('date', date);

  return new Set((data ?? []).map((c) => c.item_id));
}

export async function createChecklist(name: string, sessionTime: string | null): Promise<Checklist | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('checklists')
    .insert({ name, session_time: sessionTime, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function deleteChecklist(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('checklists').delete().eq('id', id).eq('user_id', user.id);
  return !error;
}

export async function addChecklistItem(checklistId: string, text: string, sortOrder: number) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('checklist_items')
    .insert({ checklist_id: checklistId, text, sort_order: sortOrder, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function deleteChecklistItem(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('checklist_items').delete().eq('id', id).eq('user_id', user.id);
  return !error;
}

// ponytail: streak is judged against the CURRENT item set, not the item set that
// existed on each historical day — if items are added/removed, past days are
// re-judged by today's checklist. Revisit only if that surprises the user in practice.
export async function getChecklistStreak(today: string): Promise<number> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count: totalItems } = await supabase
    .from('checklist_items')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id);

  if (!totalItems) return 0;

  const { data: completions } = await supabase
    .from('checklist_completions')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(totalItems * 60);

  const countsByDate = new Map<string, number>();
  for (const row of completions ?? []) {
    countsByDate.set(row.date, (countsByDate.get(row.date) ?? 0) + 1);
  }

  let streak = 0;
  const cursor = new Date(`${today}T00:00:00Z`);
  for (;;) {
    const dateStr = cursor.toISOString().slice(0, 10);
    if ((countsByDate.get(dateStr) ?? 0) < totalItems) break;
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}
