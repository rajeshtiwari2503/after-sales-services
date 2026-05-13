import razorpay from "@/lib/razorpay";
//added enve 
export async function POST(req: Request) {
  const body = await req.json();

  const order =
    await razorpay.orders.create({
      amount: body.amount * 100,

      currency: "INR",

      receipt: `receipt_${Date.now()}`,
    });

  return Response.json({
    success: true,
    data: order,
  });
}