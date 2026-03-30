'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function setActiveAccount(accountId: string | null) {
  if (accountId) {
    cookies().set('active_account_id', accountId, { path: '/' });
  } else {
    cookies().delete('active_account_id');
  }
  revalidatePath('/', 'layout');
}
