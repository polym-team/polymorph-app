export const dynamic = 'force-dynamic';

/** GET /api/health — k8s liveness/readiness probe용. */
export function GET(): Response {
  return Response.json({ status: 'ok' });
}
