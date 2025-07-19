import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPerformanceReview extends Document {
  employeeId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  date: Date;
  score?: number;
  comments?: string;
  goals?: string;
  taskCompletionRate?: number;
  totalTasks?: number;
  completedTasks?: number;
  uncompletedTasks?: number;
  calculatePerformanceScore(): Promise<number>;
}

const PerformanceReviewSchema: Schema<IPerformanceReview> = new Schema({
  employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
  reviewerId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
  date: { type: Date, required: true },
  score: Number,
  comments: String,
  goals: String,
  taskCompletionRate: Number,
  totalTasks: Number,
  completedTasks: Number,
  uncompletedTasks: Number,
});

// Method to calculate performance score based on task completion
PerformanceReviewSchema.methods.calculatePerformanceScore =
  async function (): Promise<number> {
    const { Task } = await import("./Task");

    // Get all tasks assigned to this employee
    const allTasks = await Task.find({ employeeId: this.employeeId });

    // Calculate task statistics
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((task) => task.completed).length;
    const uncompletedTasks = totalTasks - completedTasks;

    // Calculate completion rate (0-100)
    const taskCompletionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Update the review with task statistics
    this.totalTasks = totalTasks;
    this.completedTasks = completedTasks;
    this.uncompletedTasks = uncompletedTasks;
    this.taskCompletionRate = taskCompletionRate;

    // Calculate performance score (0-100)
    // Base score is the completion rate
    let performanceScore = taskCompletionRate;

    // Bonus points for high completion rates
    if (taskCompletionRate >= 90) {
      performanceScore += 10; // Excellent performance bonus
    } else if (taskCompletionRate >= 80) {
      performanceScore += 5; // Good performance bonus
    } else if (taskCompletionRate >= 70) {
      performanceScore += 2; // Satisfactory performance bonus
    }

    // Penalty for very low completion rates
    if (taskCompletionRate < 50) {
      performanceScore -= 10; // Poor performance penalty
    } else if (taskCompletionRate < 60) {
      performanceScore -= 5; // Below average penalty
    }

    // Ensure score is within 0-100 range
    performanceScore = Math.max(0, Math.min(100, performanceScore));

    // Update the score field
    this.score = Math.round(performanceScore);

    return this.score;
  };

// Pre-save middleware to automatically calculate score if not provided
PerformanceReviewSchema.pre("save", async function (next) {
  if (!this.score) {
    await this.calculatePerformanceScore();
  }
  next();
});

// Static method to create performance review for employee if none exists
PerformanceReviewSchema.statics.createForEmployee = async function (
  employeeId: mongoose.Types.ObjectId,
  reviewerId: mongoose.Types.ObjectId,
  date?: Date
) {
  const { Task } = await import("./Task");

  // Check if employee already has a performance review
  const existingReview = await this.findOne({ employeeId }).sort({ date: -1 });
  if (existingReview) {
    return existingReview;
  }

  // Get all tasks for the employee
  const tasks = await Task.find({ employeeId });

  if (tasks.length === 0) {
    // No tasks assigned, create a review with default score
    const review = new this({
      employeeId,
      reviewerId,
      date: date || new Date(),
      score: 50, // Default score for employees with no tasks
      comments: "No tasks assigned yet",
      totalTasks: 0,
      completedTasks: 0,
      uncompletedTasks: 0,
      taskCompletionRate: 0,
    });

    await review.save();
    return review;
  }

  // Create new performance review
  const review = new this({
    employeeId,
    reviewerId,
    date: date || new Date(),
  });

  // The pre-save middleware will calculate the score automatically
  await review.save();
  return review;
};

export const PerformanceReview: Model<IPerformanceReview> =
  mongoose.models.PerformanceReview ||
  mongoose.model<IPerformanceReview>(
    "PerformanceReview",
    PerformanceReviewSchema
  );
