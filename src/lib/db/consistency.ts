import { createServerClient } from '../supabase/server';
import type { ConsistencyTemplate, ConsistencyCalculator, ConsistencyCalculatorWithDays } from '../types';

export async function getTemplates(): Promise<ConsistencyTemplate[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('consistency_templates')
    .select('*')
    .eq('user_id', user.id)
    .order('name');

  return data ?? [];
}

export async function createTemplate(name: string, defaultPercent: number): Promise<ConsistencyTemplate | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('consistency_templates')
    .insert({ name, default_consistency_percent: defaultPercent, user_id: user.id })
    .select()
    .single();

  return data ?? null;
}

export async function deleteTemplate(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('consistency_templates').delete().eq('id', id).eq('user_id', user.id);
  return !error;
}

export async function getCalculators(): Promise<ConsistencyCalculator[]> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('consistency_calculators')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function getCalculatorWithDays(id: string): Promise<ConsistencyCalculatorWithDays | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('consistency_calculators')
    .select('*, days:consistency_calculator_days(*)')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!data) return null;

  return {
    ...data,
    days: (data.days ?? []).sort((a: { day_number: number }, b: { day_number: number }) => a.day_number - b.day_number),
  } as ConsistencyCalculatorWithDays;
}

export async function createCalculator(
  name: string,
  consistencyPercent: number
): Promise<ConsistencyCalculator | null> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: calculator, error } = await supabase
    .from('consistency_calculators')
    .insert({ name, consistency_percent: consistencyPercent, user_id: user.id })
    .select()
    .single();

  if (error || !calculator) return null;

  await supabase.from('consistency_calculator_days').insert(
    Array.from({ length: 5 }, (_, i) => ({
      calculator_id: calculator.id,
      user_id: user.id,
      day_number: i + 1,
      value: null,
    }))
  );

  return calculator;
}

export async function saveCalculator(
  id: string,
  fields: {
    name: string;
    consistency_percent: number;
    account_id: string | null;
    custom_account_size: number | null;
    target_profit: number | null;
  },
  days: { day_number: number; value: number | null }[]
): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error: updateError } = await supabase
    .from('consistency_calculators')
    .update(fields)
    .eq('id', id)
    .eq('user_id', user.id);

  if (updateError) return false;

  await supabase.from('consistency_calculator_days').delete().eq('calculator_id', id);

  if (days.length > 0) {
    await supabase.from('consistency_calculator_days').insert(
      days.map((d) => ({ calculator_id: id, user_id: user.id, day_number: d.day_number, value: d.value }))
    );
  }

  return true;
}

export async function deleteCalculator(id: string): Promise<boolean> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase.from('consistency_calculators').delete().eq('id', id).eq('user_id', user.id);
  return !error;
}
