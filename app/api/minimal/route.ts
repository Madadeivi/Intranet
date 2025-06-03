export function GET() {
  return new Response(JSON.stringify({ status: 'minimal' }), {
    headers: { 'content-type': 'application/json' },
  });
}