// @ts-ignore generated at build time
import { default as handler } from "./.open-next/worker.js";
import { scanQueue } from "@backend/workers/scan-workers";
import { unsubQueue } from "@backend/workers/unsub-workers";
import { digestQueue } from "@backend/workers/digest-workers";
import { runDigestScheduler } from "@backend/workers/digest-scheduler";

type QueueMessage =
  | { type: "scan"; userId: string }
  | { type: "unsub"; jobId: string; userId: string }
  | { type: "digest"; digestId: string };

export default {
  fetch: handler.fetch,
  async scheduled(
    event: ScheduledEvent,
    env:   CloudflareEnv,
    ctx:   ExecutionContext
  ): Promise<void> {
    ctx.waitUntil(runDigestScheduler(env))
  },
  async queue(
    batch: MessageBatch<QueueMessage>,
    env: CloudflareEnv,
    ctx: ExecutionContext,
  ): Promise<void> {
    for (const msg of batch.messages) {
      console.log(JSON.stringify({ msg }, null, 2));

      try {
        switch (msg.body.type) {
          case "scan":
            await scanQueue(msg.body, env);
            break;
          case "unsub":
            await unsubQueue(msg.body, env);
            break;
          case "digest":
            await digestQueue(msg.body, env);
            break;
        }
        msg.ack();
      } catch (err) {
        console.error("queue error", msg.body.type, err);
        msg.retry();
      }
    }
  },
};
