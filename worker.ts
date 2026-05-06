/// <reference types="@cloudflare/workers-types" />
/// <reference path="./cloudflare-env.d.ts" />
// @ts-ignore generated at build time
import { default as handler } from "./.open-next/worker.js";
import { scanQueue } from "@backend/workers/scan-workers";
import { unsubQueue } from "@backend/workers/unsub-workers";
import { digestQueue } from "@backend/workers/digest-workers";
import { runDigestScheduler } from "@backend/workers/digest-scheduler";
import { getDb } from "@backend/lib/db";
import { auditLogs } from "@backend/db/schema";
import { lt } from "drizzle-orm";
import { now } from "@backend/lib/id";

type QueueMessage =
  | { type: "scan"; userId: string }
  | { type: "unsub"; jobId: string; userId: string }
  | { type: "digest"; digestId: string };

export default {
  fetch: handler.fetch,
  async scheduled(
    _controller: ScheduledController,
    env:         CloudflareEnv,
    ctx:         ExecutionContext
  ): Promise<void> {
    const cleanupAuditLogs = async () => {
      const db = getDb(env.DB)
      await db.delete(auditLogs).where(lt(auditLogs.createdAt, now() - 48 * 3600))
    }
    ctx.waitUntil(Promise.all([runDigestScheduler(env), cleanupAuditLogs()]))
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
