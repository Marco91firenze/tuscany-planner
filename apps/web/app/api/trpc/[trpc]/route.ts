import { appRouter } from '../../../../server/routers/_app';

function getStatusCode(error: any): number {
  // Zod validation errors
  if (error?.name === 'ZodError' || error?.code === 'BAD_REQUEST') return 400;
  // TRPCError with explicit code
  if (error?.code === 'NOT_FOUND') return 404;
  if (error?.code === 'UNAUTHORIZED') return 401;
  if (error?.code === 'FORBIDDEN') return 403;
  // Custom thrown errors with messages we recognize
  const msg = error?.message || '';
  if (/not found/i.test(msg)) return 404;
  if (/exceed|invalid|conflict|required|expected/i.test(msg)) return 400;
  return 500;
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/trpc/', '');
  let body: any = null;

  try {
    body = await req.json();
    const caller = appRouter.createCaller({});
    const parts = path.split('.');

    let fn: any = caller;
    for (const part of parts) {
      fn = fn[part];
      if (!fn) {
        return Response.json(
          { error: { message: `Procedure not found: ${path}`, code: 'NOT_FOUND' } },
          { status: 404 }
        );
      }
    }

    const result = await fn(body);
    return Response.json({ result: { data: result } });
  } catch (error: any) {
    const status = getStatusCode(error);
    const message = error?.message || error?.toString() || 'Unknown error';
    const code = error?.code || (status === 400 ? 'BAD_REQUEST' : status === 404 ? 'NOT_FOUND' : 'INTERNAL_SERVER_ERROR');

    // Only log unexpected errors (5xx) at error level
    if (status >= 500) {
      console.error(`[${path}] 500:`, message);
    } else {
      console.warn(`[${path}] ${status}:`, message);
    }

    return Response.json({ error: { message, code } }, { status });
  }
}

export async function GET() {
  return Response.json({ error: { message: 'POST only', code: 'METHOD_NOT_ALLOWED' } }, { status: 405 });
}
