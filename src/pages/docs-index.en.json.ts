import type { APIRoute } from 'astro';
import { buildDocsSearchIndex } from '../data/docs';

export const GET: APIRoute = async () => {
  const index = await buildDocsSearchIndex('en');
  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
