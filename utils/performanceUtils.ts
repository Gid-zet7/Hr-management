import { PerformanceReview, Task, Employee } from "@/models";
import { dbConnect } from "@/models";

/**
 * Utility functions for performance management
 */

export interface PerformanceMetrics {
  employeeId: string;
  employeeName: string;
  totalTasks: number;
  completedTasks: number;
  uncompletedTasks: number;
  completionRate: number;
  performanceScore: number;
  lastReviewDate?: Date;
}

/**
 * Get performance metrics for all employees
 */
export async function getAllEmployeePerformanceMetrics(): Promise<
  PerformanceMetrics[]
> {
  await dbConnect();

  const employees = await Employee.find({ employmentStatus: "active" });
  const metrics: PerformanceMetrics[] = [];

  for (const employee of employees) {
    const tasks = await Task.find({ employeeId: employee._id });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Get latest performance review
    const latestReview = await PerformanceReview.findOne({
      employeeId: employee._id,
    }).sort({ date: -1 });

    metrics.push({
      employeeId: employee._id.toString(),
      employeeName: `${employee.firstName} ${employee.lastName}`,
      totalTasks,
      completedTasks,
      uncompletedTasks: totalTasks - completedTasks,
      completionRate: Math.round(completionRate * 100) / 100,
      performanceScore: latestReview?.score || 0,
      lastReviewDate: latestReview?.date,
    });
  }

  return metrics.sort((a, b) => b.performanceScore - a.performanceScore);
}

/**
 * Get performance metrics for a specific employee
 */
export async function getEmployeePerformanceMetrics(
  employeeId: string
): Promise<PerformanceMetrics | null> {
  await dbConnect();

  const employee = await Employee.findById(employeeId);
  if (!employee) return null;

  const tasks = await Task.find({ employeeId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const completionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const latestReview = await PerformanceReview.findOne({
    employeeId,
  }).sort({ date: -1 });

  return {
    employeeId: employee._id.toString(),
    employeeName: `${employee.firstName} ${employee.lastName}`,
    totalTasks,
    completedTasks,
    uncompletedTasks: totalTasks - completedTasks,
    completionRate: Math.round(completionRate * 100) / 100,
    performanceScore: latestReview?.score || 0,
    lastReviewDate: latestReview?.date,
  };
}

/**
 * Create performance reviews for all employees who don't have one
 */
export async function createMissingPerformanceReviews(
  reviewerId: string
): Promise<{
  created: number;
  skipped: number;
  errors: string[];
}> {
  await dbConnect();

  const employees = await Employee.find({ employmentStatus: "active" });
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const employee of employees) {
    try {
      const existingReview = await PerformanceReview.findOne({
        employeeId: employee._id,
      }).sort({ date: -1 });

      if (existingReview) {
        skipped++;
        continue;
      }

      await PerformanceReview.createForEmployee(
        employee._id,
        reviewerId,
        new Date()
      );
      created++;
    } catch (error) {
      errors.push(
        `Failed to create review for ${employee.firstName} ${employee.lastName}: ${error}`
      );
    }
  }

  return { created, skipped, errors };
}

/**
 * Get performance statistics for dashboard
 */
export async function getPerformanceDashboardStats() {
  await dbConnect();

  const totalEmployees = await Employee.countDocuments({
    employmentStatus: "active",
  });
  const totalTasks = await Task.countDocuments();
  const completedTasks = await Task.countDocuments({ completed: true });
  const totalReviews = await PerformanceReview.countDocuments();

  // Get average performance score
  const reviews = await PerformanceReview.find();
  const averageScore =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + (review.score || 0), 0) /
        reviews.length
      : 0;

  // Get top performers (score >= 80)
  const topPerformers = await PerformanceReview.find({ score: { $gte: 80 } })
    .populate("employeeId", "firstName lastName")
    .sort({ score: -1 })
    .limit(5);

  return {
    totalEmployees,
    totalTasks,
    completedTasks,
    completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    totalReviews,
    averageScore: Math.round(averageScore * 100) / 100,
    topPerformers: topPerformers.map((review) => ({
      employeeName: `${review.employeeId.firstName} ${review.employeeId.lastName}`,
      score: review.score,
      taskCompletionRate: review.taskCompletionRate,
    })),
  };
}

/**
 * Calculate performance score manually (for testing or specific scenarios)
 */
export async function calculateManualPerformanceScore(
  employeeId: string
): Promise<{
  score: number;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  breakdown: {
    baseScore: number;
    bonus: number;
    penalty: number;
  };
}> {
  await dbConnect();

  const tasks = await Task.find({ employeeId });
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const taskCompletionRate =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Calculate performance score using the same logic as the model
  let baseScore = taskCompletionRate;
  let bonus = 0;
  let penalty = 0;

  // Bonus points for high completion rates
  if (taskCompletionRate >= 90) {
    bonus = 10; // Excellent performance bonus
  } else if (taskCompletionRate >= 80) {
    bonus = 5; // Good performance bonus
  } else if (taskCompletionRate >= 70) {
    bonus = 2; // Satisfactory performance bonus
  }

  // Penalty for very low completion rates
  if (taskCompletionRate < 50) {
    penalty = 10; // Poor performance penalty
  } else if (taskCompletionRate < 60) {
    penalty = 5; // Below average penalty
  }

  const finalScore = Math.max(0, Math.min(100, baseScore + bonus - penalty));

  return {
    score: Math.round(finalScore),
    taskCompletionRate: Math.round(taskCompletionRate * 100) / 100,
    totalTasks,
    completedTasks,
    breakdown: {
      baseScore: Math.round(baseScore * 100) / 100,
      bonus,
      penalty,
    },
  };
}
