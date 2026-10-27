import { runtimeKey } from '../../../lib/runtime';
import { MODEL, LIMITS } from '../../../lib/nebius.mjs';
export function GET() {
  return Response.json({ configured: !!runtimeKey(), provider: 'Nebius Token Factory', model: MODEL,
    verified: false, note: 'Configuration is not proof of successful inference. Each live run includes provider request IDs.', limits: LIMITS }, { headers: { 'Cache-Control': 'no-store' } });
}
