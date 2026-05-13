// import {
//   NextRequest,
//   NextResponse,
// } from "next/server";

// import { elastic } from "@/lib/elasticsearch";

// export async function GET(
//   req: NextRequest
// ) {
//   const query =
//     req.nextUrl.searchParams.get(
//       "q"
//     );

//   const result =
//     await elastic.search({
//       index:
//         "tickets",

//       query: {
//         multi_match: {
//           query,

//           fields: [
//             "title",
//             "description",
//             "customerName",
//           ],
//         },
//       },
//     });

//   return NextResponse.json(
//     result.hits.hits
//   );
// }


import {
  NextRequest,
  NextResponse,
} from "next/server";

import { elastic } from "@/lib/elasticsearch";

export async function GET(
  req: NextRequest
) {
  const query =
    req.nextUrl.searchParams.get("q") || "";

  const result =
    await elastic.search({
      index: "tickets",

      query: {
        multi_match: {
          query,

          fields: [
            "title",
            "description",
            "customerName",
          ],
        },
      },
    });

  return NextResponse.json(
    result.hits.hits
  );
}