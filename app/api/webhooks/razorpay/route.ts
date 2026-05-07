export async function POST(req: Request) {
  const body = await req.json();

  console.log("Webhook:", body);

  return Response.json({
    success: true,
  });
}