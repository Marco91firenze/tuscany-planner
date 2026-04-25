import { appRouter } from '../../../../server/routers/_app';

function getStatusCode(error: any): number {
  // Unwrap nested cause chain (tRPC wraps errors)
  let cur = error;
  for (let i = 0; i < 5 && cur; i++) {
    // Zod validation errors
    if (cur?.name === 'ZodError') return 400;
    if (cur?.code === 'BAD_REQUEST') return 400;
    // TRPCError with explicit code
    if (cur?.code === 'NOT_FOUND') return 404;
    if (cur?.code === 'UNAUTHORIZED') return 401;
    if (cur?.code === 'FORBIDDEN') return 403;
    cur = cur.cause;
  }
  // Custom thrown errors - pattern match message
  const msg = error?.message || '';
  if (/unauthorized/i.test(msg)) return 401;
  if (/forbidden/i.test(msg)) return 403;
  if (/not found/i.test(msg)) return 404;
  if (/already submitted/i.test(msg)) return 400;
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
    const codeFromStatus =
      status === 400 ? 'BAD_REQUEST'
      : status === 401 ? 'UNAUTHORIZED'
      : status === 403 ? 'FORBIDDEN'
      : status === 404 ? 'NOT_FOUND'
      : 'INTERNAL_SERVER_ERROR';
    const code = error?.code && error.code !== 'INTERNAL_SERVER_ERROR' ? error.code : codeFromStatus;

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
