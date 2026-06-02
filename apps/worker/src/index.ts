import { createWorkerQueueSnapshot, workerJobs } from "./jobs";

console.log("GitHub Profile Studio worker ready", {
  jobs: workerJobs,
  queue: createWorkerQueueSnapshot("new-developer").map((plan) => ({
    job: plan.job.name,
    schedule: plan.job.schedule,
    operations: plan.operations.length,
    files: plan.run.summary.files,
    acceptanceIds: plan.run.summary.acceptanceIds
  }))
});
