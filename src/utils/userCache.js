import { api } from '../services/api';

const cache = new Map();

export async function getUserProfile(id) {
  if (cache.has(id)) return cache.get(id);

  const promise = api.users.getById(id).catch(() => ({
    id,
    display_name: 'Unknown user',
    handle: '',
  }));

  cache.set(id, promise);
  return promise;
}