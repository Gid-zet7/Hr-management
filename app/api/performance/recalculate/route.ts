import { NextResponse } from "next/server";
import { dbConnect, PerformanceReview, Task } from "@/models";

// Admin: Recalculate performance scores
export async function POST(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const body = await request.json();
    const { employeeId, reviewId } = body;

    if (reviewId) {
      // Recalculate score for a specific review
      const review = await PerformanceReview.findById(reviewId);
      if (!review) {
        return NextResponse.json(
          { error: "Performance review not found" },
          { status: 404 }
        );
      }

      const newScore = await review.calculatePerformanceScore();
      await review.save();

      await review.populate("employeeId", "firstName lastName email");
      await review.populate("reviewerId", "firstName lastName email");

      return NextResponse.json({
        message: "Performance score recalculated successfully",
        review,
        newScore,
      });
    } else if (employeeId) {
      // Recalculate scores for all reviews of a specific employee
      const reviews = await PerformanceReview.find({ employeeId });
      const results = [];

      for (const review of reviews) {
        const newScore = await review.calculatePerformanceScore();
        await review.save();
        results.push({
          reviewId: review._id,
          newScore,
          taskCompletionRate: review.taskCompletionRate,
          totalTasks: review.totalTasks,
          completedTasks: review.completedTasks,
        });
      }

      return NextResponse.json({
        message: `Recalculated ${results.length} performance reviews`,
        results,
      });
    } else {
      // Recalculate all performance reviews
      const reviews = await PerformanceReview.find();
      const results = [];

      for (const review of reviews) {
        const newScore = await review.calculatePerformanceScore();
        await review.save();
        results.push({
          reviewId: review._id,
          employeeId: review.employeeId,
          newScore,
          taskCompletionRate: review.taskCompletionRate,
          totalTasks: review.totalTasks,
          completedTasks: review.completedTasks,
        });
      }

      return NextResponse.json({
        message: `Recalculated ${results.length} performance reviews`,
        results,
      });
    }
  } catch (error) {
    console.error("Error recalculating performance scores:", error);
    return NextResponse.json(
      { error: "Failed to recalculate performance scores" },
      { status: 500 }
    );
  }
}

// Admin: Get performance statistics for an employee
export async function GET(request: Request) {
  try {
    await dbConnect();
    // TODO: Add authentication check here

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get("employeeId");

    if (!employeeId) {
      return NextResponse.json(
        { error: "Employee ID is required" },
        { status: 400 }
      );
    }

    // Get all tasks for the employee
    const tasks = await Task.find({ employeeId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((task) => task.completed).length;
    const uncompletedTasks = totalTasks - completedTasks;
    const completionRate =
      totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Get the latest performance review
    const latestReview = await PerformanceReview.findOne({ employeeId })
      .sort({ date: -1 })
      .populate("employeeId", "firstName lastName email");

    return NextResponse.json({
      employeeId,
      taskStatistics: {
        totalTasks,
        completedTasks,
        uncompletedTasks,
        completionRate: Math.round(completionRate * 100) / 100,
      },
      latestReview,
    });
  } catch (error) {
    console.error("Error fetching performance statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch performance statistics" },
      { status: 500 }
    );
  }
}
