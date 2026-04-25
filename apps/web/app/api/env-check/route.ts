export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const sanityKey = process.env.SANITY_API_TOKEN;

  return Response.json({
    database: {
      set: !!dbUrl,
      startsWithPostgresql: dbUrl?.startsWith('postgresql://') || false,
      endsWithCorrectSuffix: dbUrl?.endsWith('sslmode=require') || false,
      length: dbUrl?.length || 0,
      preview: dbUrl ? `${dbUrl.substring(0, 40)}...${dbUrl.substring(dbUrl.length - 20)}` : 'NOT SET',
    },
    sanity: {
      set: !!sanityKey,
      length: sanityKey?.length || 0,
    },
    allEnvVars: Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC_') || k === 'DATABASE_URL' || k === 'SESSION_SECRET').length,
  });
}
