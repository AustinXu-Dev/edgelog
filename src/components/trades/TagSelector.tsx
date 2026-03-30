'use client';

import { useState } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { TradeTag } from '@/lib/types';

const TAG_COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0891b2'];

interface Props {
  tradeId: string;
  allTags: TradeTag[];
  selectedTagIds: string[];
  onUpdate?: () => void;
}

export function TagSelector({ tradeId, allTags, selectedTagIds: initialSelected, onUpdate }: Props) {
  const supabase = createBrowserClient();
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [tags, setTags] = useState<TradeTag[]>(allTags);
  const [saving, setSaving] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  async function toggleTag(tagId: string) {
    const next = selected.includes(tagId)
      ? selected.filter((id) => id !== tagId)
      : [...selected, tagId];
    setSelected(next);
    await saveLinks(next);
  }

  async function saveLinks(tagIds: string[]) {
    setSaving(true);
    await supabase.from('trade_tag_links').delete().eq('trade_id', tradeId);
    if (tagIds.length > 0) {
      await supabase.from('trade_tag_links').insert(tagIds.map((tag_id) => ({ trade_id: tradeId, tag_id })));
    }
    setSaving(false);
    onUpdate?.();
  }

  async function createTag() {
    if (!newTagName.trim()) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('trade_tags')
      .insert({ name: newTagName.trim(), color: newTagColor, user_id: user.id })
      .select()
      .single();

    if (data) {
      setTags((prev) => [...prev, data]);
      setNewTagName('');
      setShowCreate(false);
      await toggleTag(data.id);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isSelected = selected.includes(tag.id);
          return (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-40 hover:opacity-70'}`}
            >
              <Badge label={tag.name} color={tag.color} />
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-0.5 border border-dashed border-gray-300 rounded-full"
        >
          + new tag
        </button>
      </div>

      {showCreate && (
        <div className="flex items-end gap-2 flex-wrap">
          <Input
            label="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. breakout"
            className="w-36"
          />
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Color</label>
            <div className="flex gap-1">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewTagColor(c)}
                  className={`w-5 h-5 rounded-full transition-transform ${newTagColor === c ? 'ring-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button size="sm" onClick={createTag} type="button">Create</Button>
        </div>
      )}
      {saving && <p className="text-xs text-gray-400">Saving...</p>}
    </div>
  );
}
