import { writable } from 'svelte/store';

export const contractUUIDs = writable<string[]>([]);