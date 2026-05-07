import admin from "@/lib/firebase";

export async function sendPushNotification(
  token: string,
  title: string,
  body: string
) {
  return admin.messaging().send({
    token,

    notification: {
      title,
      body,
    },
  });
}