import { consumer } from "@/shared/kafka";

async function runConsumer() {
  await consumer.connect();

  await consumer.subscribe({
    topic: "ticket-created",
  });

  await consumer.run({
    eachMessage: async ({
      message,
    }) => {
      console.log(
        "Received Event:",
        message.value?.toString()
      );
    },
  });
}

runConsumer();