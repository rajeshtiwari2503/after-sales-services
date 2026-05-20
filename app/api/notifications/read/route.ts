//  import { NextRequest } from "next/server";

// import { getAuthUser } from "@/lib/auth-helper";

// import {
//   successResponse,
//   errorResponse,
// } from "@/utils/apiResponse";

// // ======================
// // MARK NOTIFICATION AS READ
// // ======================

// export async function PATCH(
//   request: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   try {
//     const user = await getAuthUser(request);

//     if (!user) {
//       return errorResponse(
//         "Unauthorized",
//         401
//       );
//     }

//     const { id } = await context.params;

//     // TODO:
//     // Replace with actual DB update

//     return successResponse(
//       {
//         id,
//         isRead: true,
//       },
//       "Notification marked as read"
//     );
//   } catch (error) {
//     console.error(
//       "[NOTIFICATION_PATCH_ERROR]",
//       error
//     );

//     return errorResponse(
//       "Internal Server Error",
//       500
//     );
//   }
// }
import { NextRequest } from "next/server";

import { getAuthUser } from "@/lib/auth-helper";

import {
  successResponse,
  errorResponse,
} from "@/utils/apiResponse";

// ======================
// MARK ALL NOTIFICATIONS AS READ
// ======================

export async function PATCH(
  request: NextRequest
) {
  try {
    const user = await getAuthUser(request);

    if (!user) {
      return errorResponse(
        "Unauthorized",
        401
      );
    }

    // TODO:
    // Update notifications in DB

    return successResponse(
      {
        isRead: true,
      },
      "Notifications marked as read"
    );
  } catch (error) {
    console.error(
      "[NOTIFICATION_PATCH_ERROR]",
      error
    );

    return errorResponse(
      "Internal Server Error",
      500
    );
  }
}