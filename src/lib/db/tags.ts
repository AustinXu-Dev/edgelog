import { createServerClient } from '../supabase/server';
import type { TradeTag } from '../types';

export async function getTags(): Promise<TradeTag[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('trade_tags')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  return data ?? [];
}

export async function createTag(name: string, color: string): Promise<TradeTag | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('trade_tags')
    .insert({ name, color, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function deleteTag(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('trade_tags')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  return !error;
}

export async function setTradeTagLinks(tradeId: string, tagIds: string[]): Promise<void> {
  const supabase = createServerClient();

  // Delete existing links
  await supabase.from('trade_tag_links').delete().eq('trade_id', tradeId);

  if (tagIds.length === 0) return;

  await supabase.from('trade_tag_links').insert(
    tagIds.map((tag_id) => ({ trade_id: tradeId, tag_id }))
  );
}

export async function getTagsForTrade(tradeId: string): Promise<TradeTag[]> {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('trade_tag_links')
    .select('trade_tags(id, name, color, user_id)')
    .eq('trade_id', tradeId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data?.map((l: any) => l.trade_tags).filter(Boolean) ?? []) as TradeTag[];
}
