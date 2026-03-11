import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";

@Processor("default")
export class JobsProcessor extends WorkerHost {
  async process(job: Job): Promise<any> {
    // Aqui é onde entra IA, e-mail, relatórios, importação, etc.
    // Por enquanto é só um exemplo:
    return { ok: true, jobId: job.id, name: job.name, data: job.data };
  }
}
