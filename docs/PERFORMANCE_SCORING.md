# Automatic Performance Scoring System

This document explains how the automatic performance scoring system works in the HR Management application.

## Overview

The performance scoring system automatically calculates employee performance scores based on their task completion rates. The system is designed to be:

- **Automatic**: Scores are calculated automatically when tasks are updated
- **Transparent**: Clear scoring logic with bonuses and penalties
- **Real-time**: Performance scores update immediately when task status changes
- **Comprehensive**: Includes detailed metrics and statistics

## How It Works

### 1. Task Completion Tracking

The system tracks all tasks assigned to employees and their completion status:

```typescript
interface ITask {
  title: string;
  description?: string;
  employeeId: mongoose.Types.ObjectId;
  dueDate?: Date;
  completed: boolean; // Key field for performance calculation
  createdAt: Date;
}
```

### 2. Performance Score Calculation

Performance scores are calculated using the following formula:

**Base Score**: Task completion rate (0-100%)

**Bonus Points**:

- 90%+ completion: +10 points (Excellent)
- 80-89% completion: +5 points (Good)
- 70-79% completion: +2 points (Satisfactory)

**Penalties**:

- Below 50% completion: -10 points (Poor)
- 50-59% completion: -5 points (Below average)

**Final Score**: Base score + bonus - penalty (capped at 0-100)

### 3. Automatic Updates

The system automatically updates performance scores when:

- A task is marked as completed/uncompleted
- A new performance review is created
- Bulk task updates are performed

## API Endpoints

### Create Performance Review

```http
POST /api/performance
Content-Type: application/json

{
  "employeeId": "employee_id_here",
  "reviewerId": "admin_id_here",
  "comments": "Optional comments",
  "goals": "Optional goals"
}
```

The score will be calculated automatically based on task completion.

### Get Performance Statistics

```http
GET /api/performance/recalculate?employeeId=employee_id_here
```

Returns task statistics and latest performance review for an employee.

### Recalculate Performance Scores

```http
POST /api/performance/recalculate
Content-Type: application/json

{
  "employeeId": "employee_id_here"  // Optional: specific employee
  "reviewId": "review_id_here"      // Optional: specific review
}
```

If no parameters provided, recalculates all performance reviews.

## Usage Examples

### 1. Creating a Performance Review

```typescript
import { PerformanceReview } from "@/models";

// Create a new performance review (score calculated automatically)
const review = new PerformanceReview({
  employeeId: "employee_id",
  reviewerId: "admin_id",
  comments: "Great work this quarter!",
});

await review.save(); // Score is calculated automatically
console.log(`Performance Score: ${review.score}`);
console.log(`Task Completion Rate: ${review.taskCompletionRate}%`);
```

### 2. Getting Performance Metrics

```typescript
import { getAllEmployeePerformanceMetrics } from "@/utils/performanceUtils";

const metrics = await getAllEmployeePerformanceMetrics();
metrics.forEach((metric) => {
  console.log(`${metric.employeeName}: ${metric.performanceScore}/100`);
});
```

### 3. Manual Score Calculation

```typescript
import { calculateManualPerformanceScore } from "@/utils/performanceUtils";

const result = await calculateManualPerformanceScore("employee_id");
console.log(`Score: ${result.score}`);
console.log(`Completion Rate: ${result.taskCompletionRate}%`);
console.log(
  `Breakdown: Base ${result.breakdown.baseScore} + Bonus ${result.breakdown.bonus} - Penalty ${result.breakdown.penalty}`
);
```

### 4. Creating Missing Performance Reviews

```typescript
import { createMissingPerformanceReviews } from "@/utils/performanceUtils";

const result = await createMissingPerformanceReviews("admin_id");
console.log(`Created: ${result.created}, Skipped: ${result.skipped}`);
```

## Performance Review Model

The enhanced PerformanceReview model includes:

```typescript
interface IPerformanceReview {
  employeeId: mongoose.Types.ObjectId;
  reviewerId: mongoose.Types.ObjectId;
  date: Date;
  score: number; // Calculated performance score (0-100)
  comments?: string;
  goals?: string;
  taskCompletionRate?: number; // Task completion percentage
  totalTasks?: number; // Total tasks assigned
  completedTasks?: number; // Completed tasks count
  uncompletedTasks?: number; // Uncompleted tasks count
  calculatePerformanceScore(): Promise<number>; // Method to recalculate score
}
```

## Dashboard Statistics

Use the utility functions to get comprehensive performance statistics:

```typescript
import { getPerformanceDashboardStats } from "@/utils/performanceUtils";

const stats = await getPerformanceDashboardStats();
console.log(`Average Score: ${stats.averageScore}`);
console.log(`Top Performers: ${stats.topPerformers.length}`);
```

## Best Practices

1. **Regular Reviews**: Create performance reviews regularly (monthly/quarterly)
2. **Task Management**: Ensure tasks are properly assigned and updated
3. **Score Monitoring**: Monitor performance trends over time
4. **Manual Override**: Use the recalculate endpoint when needed
5. **Data Validation**: Verify task completion data accuracy

## Troubleshooting

### Score Not Updating

- Check if tasks are properly linked to employees
- Verify task completion status is correctly set
- Use the recalculate endpoint to force update

### Unexpected Scores

- Review the scoring formula in the documentation
- Check task completion rates manually
- Use the manual calculation function for verification

### Performance Issues

- Consider indexing on employeeId and completed fields
- Use bulk operations for large datasets
- Monitor database query performance

## Future Enhancements

Potential improvements to consider:

1. **Weighted Tasks**: Different task types with different weights
2. **Time-based Scoring**: Consider task deadlines and completion timing
3. **Peer Reviews**: Include peer feedback in scoring
4. **Historical Trends**: Track performance over time
5. **Custom Scoring**: Allow custom scoring rules per department
