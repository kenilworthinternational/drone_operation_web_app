import { nodeBackendBaseQuery } from './services NodeJs/nodeBackendConfig';

/**
 * POST to a legacy PHP-compat path on the Node backend (/api/<path>).
 * Used by migrated RTK endpoints that previously hit drone-admin PHP.
 */
export async function legacyPhpPost(path, body = {}) {
  const normalized = String(path || '').replace(/^\//, '');
  return nodeBackendBaseQuery(
    { url: `/api/${normalized}`, method: 'POST', body },
    {},
    {}
  );
}

export async function legacyPhpPostData(path, body = {}) {
  const result = await legacyPhpPost(path, body);
  if (result.error) return result;
  return { data: result.data };
}
