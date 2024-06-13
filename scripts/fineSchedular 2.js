import cron from "node-cron";
import Fine from "../_models/fine/fine.model.js";
import Issue from "../_models/Issue/issue.model.js";
import AsyncErrorHandler from "../middlewares/AsyncErrorHandler.js";

const calculateFine = AsyncErrorHandler(async () => {
  const statuses = [
    "issued",
    "fining",
    "fining-returned",
    "renew-approved",
    "renew-requested",
  ];
  const overdueIssues = await Issue.find({
    deadline: { $lt: new Date() },
    status: { $in: statuses },
  }).populate("libraryId");

  if (!overdueIssues || overdueIssues.length === 0) {
    console.log("No overdue issues found.");
    return;
  }

  let count = 0;

  for (const issue of overdueIssues) {
    const library = issue.libraryId;
    const fineInterest = library.fineInterest;
    if (!fineInterest) {
      console.log("Fine interest not set for library:", library.name);
      continue;
    }
    const currentDate = new Date();
    const overdueDays = Math.ceil(
      (currentDate - issue.deadline) / (1000 * 60 * 60 * 24)
    );

    if (overdueDays <= 0) {
      console.log("Skipping issue:", issue._id);
      continue;
    }
    let fine = await Fine.findOne({
      issueId: issue._id,
      status: { $nin: ["Revoked", "Completed"] },
    });

    issue.status = "fining";
    await issue.save();

    if (!fine) {
      fine = new Fine({
        userId: issue.userId,
        issueId: issue._id,
        amount: fineInterest * overdueDays,
        category: "Due date exceeded",
        status: "Pending",
        interest: fineInterest,
      });
    } else {
      if (fine.amount == fineInterest * overdueDays) {
        console.log("Fine already calculated for issue:", issue._id);
        continue;
      }
      fine.amount = fineInterest * overdueDays;
    }
    count++;
    await fine.save();
  }

  console.log("Calculated fine for", count, "issues.");
});

cron.schedule("0 0 * * *", () => {
  console.log("Running fine schedular...");
  calculateFine();
});

