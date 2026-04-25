export async function POST(req: Request) {
  try {
    const text = await req.text();
    return Response.json({
      success: true,
      receivedBody: text,
      contentType: req.headers.get('content-type'),
    });
  } catch (error) {
    return Response.json({
      success: false,
      error: (error as Error).message,
    }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ ok: true });
}
