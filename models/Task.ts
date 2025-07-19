import mongoose, { Document, Schema, Model } from "mongoose";

export interface ITask extends Document {
  title: string;
  description?: string;
  employeeId: mongoose.Types.ObjectId;
  dueDate?: Date;
  completed?: boolean;
  createdAt?: Date;
}

const TaskSchema: Schema<ITask> = new Schema({
  title: { type: String, required: true },
  description: String,
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  dueDate: Date,
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Post-save middleware to update performance scores when task completion changes
TaskSchema.post("save", async function (doc) {
  try {
    const { PerformanceReview } = await import("./PerformanceReview");

    // Find the latest performance review for this employee
    const latestReview = await PerformanceReview.findOne({
      employeeId: doc.employeeId,
    }).sort({ date: -1 });

    if (latestReview) {
      // Recalculate the performance score
      await latestReview.calculatePerformanceScore();
      await latestReview.save();
    }
  } catch (error) {
    console.error("Error updating performance score after task change:", error);
  }
});

// Post-update middleware to handle bulk updates
TaskSchema.post("updateOne", async function () {
  try {
    const { PerformanceReview } = await import("./PerformanceReview");

    // Get the employee ID from the update query
    const employeeId = this.getQuery().employeeId;

    if (employeeId) {
      // Find the latest performance review for this employee
      const latestReview = await PerformanceReview.findOne({
        employeeId,
      }).sort({ date: -1 });

      if (latestReview) {
        // Recalculate the performance score
        await latestReview.calculatePerformanceScore();
        await latestReview.save();
      }
    }
  } catch (error) {
    console.error("Error updating performance score after task update:", error);
  }
});

export const Task: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>("Task", TaskSchema);
