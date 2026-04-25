import { appRouter } from '../../../../server/routers/_app';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/trpc/', '');

    const body = await req.json();
    console.log('Request:', { path, body });

    const caller = appRouter.createCaller({});
    const parts = path.split('.');

    // Navigate through routers: trip.create -> caller.trip.create
    let fn: any = caller;
    for (const part of parts) {
      fn = fn[part];
      if (!fn) {
        return Response.json({ error: `Procedure not found: ${path}` }, { status: 404 });
      }
    }

    const result = await fn(body);
    return Response.json({ result: { data: result } });
  } catch (error: any) {
    console.error('Error:', error);
    const message = error?.message || error?.toString() || 'Unknown error';
    const code = error?.code || 'INTERNAL_SERVER_ERROR';

    return Response.json({
      error: { message, code }
    }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return Response.json({ error: 'POST only' }, { status: 405 });
}
