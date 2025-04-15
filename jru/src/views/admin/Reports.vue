<template>
  <div class="dashboard-container">
    <Header :user="user" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    
    <div class="dashboard-content">
      <SideBar :isCollapsed="isSidebarCollapsed" />
      
      <main class="dashboard-main">
        <div class="page-info">
          <h1 class="page-title">Reports & Analytics</h1>
          <p class="page-description">  Gain insights into platform performance, user activity, course engagement, and academic outcomes with comprehensive, real-time analytics.
          </p>
        </div>

        <div class="report-filters">
          <div class="filter-group">
            <label for="report-type">Report Type:</label>
            <select id="report-type" v-model="selectedReportType">
              <option value="user">User Statistics</option>
              <option value="course">Course Statistics</option>
              <option value="performance">Performance Analytics</option>
              <option value="activity">Activity Analytics</option>
            </select>
          </div>

          <div class="filter-group">
            <label for="time-period">Time Period:</label>
            <select id="time-period" v-model="selectedTimePeriod">
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>

          <button @click="generateReport" class="generate-btn">Generate Report</button>
        </div>

        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Generating report...</p>
        </div>

        <div v-else>
          <!-- User Statistics Section -->
          <div v-if="selectedReportType === 'user'" class="report-section">
            <div class="stats-cards">
              <div class="stat-card">
                <h3>Total Users</h3>
                <div class="stat-value">{{ userStats.totalUsers }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ userStats.userGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Active Users</h3>
                <div class="stat-value">{{ userStats.activeUsers }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ userStats.activeGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>New Registrations</h3>
                <div class="stat-value">{{ userStats.newUsers }}</div>
                <div class="stat-change negative">
                  <i class="pi pi-arrow-down"></i> {{ userStats.regDecline }}%
                </div>
              </div>
            </div>

            <div class="chart-container">
              <h3>User Registration Trends</h3>
              <div class="chart-placeholder">
                <p>User registration chart would be displayed here</p>
                <div class="mock-chart">
                  <div class="bar" v-for="(height, index) in mockChartData" :key="index" :style="{height: height + '%'}"></div>
                </div>
              </div>
            </div>

            <div class="data-table">
              <h3>User Distribution</h3>
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Percentage</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(role, index) in userStats.distribution" :key="index">
                    <td>{{ role.role }}</td>
                    <td>{{ role.count }}</td>
                    <td>{{ role.percentage }}%</td>
                    <td>
                      <span :class="role.change > 0 ? 'positive' : 'negative'">
                        <i :class="role.change > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                        {{ Math.abs(role.change) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Course Statistics Section -->
          <div v-if="selectedReportType === 'course'" class="report-section">
            <div class="stats-cards">
              <div class="stat-card">
                <h3>Total Courses</h3>
                <div class="stat-value">{{ courseStats.totalCourses }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ courseStats.courseGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Active Enrollments</h3>
                <div class="stat-value">{{ courseStats.activeEnrollments }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ courseStats.enrollmentGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Course Completion</h3>
                <div class="stat-value">{{ courseStats.completionRate }}%</div>
                <div class="stat-change negative">
                  <i class="pi pi-arrow-down"></i> {{ courseStats.completionChange }}%
                </div>
              </div>
            </div>

            <div class="chart-container">
              <h3>Popular Courses</h3>
              <div class="chart-placeholder">
                <p>Course popularity chart would be displayed here</p>
                <div class="mock-chart horizontal">
                  <div class="h-bar" v-for="(width, index) in mockHorizontalData" :key="index" :style="{width: width + '%'}"></div>
                </div>
              </div>
            </div>

            <div class="data-table">
              <h3>Course Performance</h3>
              <table>
                <thead>
                  <tr>
                    <th>Course Name</th>
                    <th>Enrolled</th>
                    <th>Completion Rate</th>
                    <th>Avg. Grade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(course, index) in courseStats.courses" :key="index">
                    <td>{{ course.name }}</td>
                    <td>{{ course.enrolled }}</td>
                    <td>{{ course.completionRate }}%</td>
                    <td>{{ course.avgGrade }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Performance Analytics Section -->
          <div v-if="selectedReportType === 'performance'" class="report-section">
            <div class="stats-cards">
              <div class="stat-card">
                <h3>Average Grade</h3>
                <div class="stat-value">{{ performanceStats.avgGrade }}%</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ performanceStats.gradeImprovement }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Pass Rate</h3>
                <div class="stat-value">{{ performanceStats.passRate }}%</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ performanceStats.passRateChange }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Assignment Completion</h3>
                <div class="stat-value">{{ performanceStats.assignmentCompletion }}%</div>
                <div class="stat-change negative">
                  <i class="pi pi-arrow-down"></i> {{ performanceStats.assignmentChange }}%
                </div>
              </div>
            </div>

            <div class="chart-container">
              <h3>Grade Distribution</h3>
              <div class="chart-placeholder">
                <p>Grade distribution chart would be displayed here</p>
                <div class="mock-chart">
                  <div class="bar" v-for="(height, index) in mockPerformanceData" :key="index" :style="{height: height + '%'}"></div>
                </div>
              </div>
            </div>

            <div class="data-table">
              <h3>Performance by Department</h3>
              <table>
                <thead>
                  <tr>
                    <th>Department</th>
                    <th>Avg. Grade</th>
                    <th>Pass Rate</th>
                    <th>Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(dept, index) in performanceStats.departments" :key="index">
                    <td>{{ dept.name }}</td>
                    <td>{{ dept.avgGrade }}%</td>
                    <td>{{ dept.passRate }}%</td>
                    <td>{{ dept.retention }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Activity Analytics Section -->
          <div v-if="selectedReportType === 'activity'" class="report-section">
            <div class="stats-cards">
              <div class="stat-card">
                <h3>Daily Active Users</h3>
                <div class="stat-value">{{ activityStats.dailyActiveUsers }}</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ activityStats.dauGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Session Duration</h3>
                <div class="stat-value">{{ activityStats.avgSessionTime }} min</div>
                <div class="stat-change positive">
                  <i class="pi pi-arrow-up"></i> {{ activityStats.sessionGrowth }}%
                </div>
              </div>
              <div class="stat-card">
                <h3>Resource Downloads</h3>
                <div class="stat-value">{{ activityStats.downloads }}</div>
                <div class="stat-change negative">
                  <i class="pi pi-arrow-down"></i> {{ activityStats.downloadDecline }}%
                </div>
              </div>
            </div>

            <div class="chart-container">
              <h3>Activity by Time of Day</h3>
              <div class="chart-placeholder">
                <p>Activity chart would be displayed here</p>
                <div class="mock-chart">
                  <div class="bar" v-for="(height, index) in mockActivityData" :key="index" :style="{height: height + '%'}"></div>
                </div>
              </div>
            </div>

            <div class="data-table">
              <h3>Most Used Features</h3>
              <table>
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Usage Count</th>
                    <th>% of Total</th>
                    <th>Change</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(feature, index) in activityStats.features" :key="index">
                    <td>{{ feature.name }}</td>
                    <td>{{ feature.count }}</td>
                    <td>{{ feature.percentage }}%</td>
                    <td>
                      <span :class="feature.change > 0 ? 'positive' : 'negative'">
                        <i :class="feature.change > 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'"></i>
                        {{ Math.abs(feature.change) }}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="export-section">
          <button class="export-btn"><i class="pi pi-file-pdf"></i> Export as PDF</button>
          <button class="export-btn"><i class="pi pi-file-excel"></i> Export as Excel</button>
          <button class="export-btn"><i class="pi pi-print"></i> Print Report</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import Header from '@/components/header.vue';
import SideBar from '@/components/admin/sidebar.vue';

export default {
  name: 'ReportsAnalytics',
  components: {
    Header,
    SideBar,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      searchQuery: '',
      user: {
        name: 'Admin User',
        role: 'admin'
      },
      isSidebarCollapsed: false,
      isLoading: false,
      selectedReportType: 'user',
      selectedTimePeriod: 'month',
      userStats: {
        totalUsers: 1528,
        userGrowth: 12.5,
        activeUsers: 876,
        activeGrowth: 8.3,
        newUsers: 145,
        regDecline: 3.7,
        distribution: [
          { role: 'Students', count: 1200, percentage: 78.5, change: 14.2 },
          { role: 'Faculty', count: 45, percentage: 2.9, change: 5.6 },
          { role: 'Administrative', count: 28, percentage: 1.8, change: 0 },
          { role: 'Technical Staff', count: 15, percentage: 1.0, change: -2.3 },
          { role: 'Others', count: 240, percentage: 15.7, change: -4.8 }
        ]
      },
      courseStats: {
        totalCourses: 87,
        courseGrowth: 5.2,
        activeEnrollments: 3245,
        enrollmentGrowth: 7.8,
        completionRate: 68,
        completionChange: 2.5,
        courses: [
          { name: 'Introduction to Computer Science', enrolled: 245, completionRate: 72, avgGrade: 84 },
          { name: 'Advanced Database Systems', enrolled: 120, completionRate: 65, avgGrade: 78 },
          { name: 'Software Engineering', enrolled: 180, completionRate: 70, avgGrade: 81 },
          { name: 'Data Structures and Algorithms', enrolled: 210, completionRate: 64, avgGrade: 76 },
          { name: 'Web Development', enrolled: 195, completionRate: 75, avgGrade: 85 }
        ]
      },
      performanceStats: {
        avgGrade: 78.5,
        gradeImprovement: 3.2,
        passRate: 85.3,
        passRateChange: 2.1,
        assignmentCompletion: 74.8,
        assignmentChange: 1.5,
        departments: [
          { name: 'Computer Science', avgGrade: 82.3, passRate: 87.8, retention: 92.5 },
          { name: 'Engineering', avgGrade: 78.5, passRate: 83.2, retention: 89.7 },
          { name: 'Business', avgGrade: 76.2, passRate: 81.5, retention: 87.3 },
          { name: 'Mathematics', avgGrade: 74.8, passRate: 79.3, retention: 84.6 },
          { name: 'Liberal Arts', avgGrade: 81.9, passRate: 85.7, retention: 91.2 }
        ]
      },
      activityStats: {
        dailyActiveUsers: 745,
        dauGrowth: 15.3,
        avgSessionTime: 37,
        sessionGrowth: 8.7,
        downloads: 1256,
        downloadDecline: 2.8,
        features: [
          { name: 'Course Materials', count: 4235, percentage: 35.8, change: 12.5 },
          { name: 'Assignment Submission', count: 2845, percentage: 24.1, change: 8.7 },
          { name: 'Discussion Forums', count: 1756, percentage: 14.8, change: 5.3 },
          { name: 'Quizzes', count: 1435, percentage: 12.1, change: -3.2 },
          { name: 'Calendar', count: 1568, percentage: 13.2, change: 7.6 }
        ]
      },
      mockChartData: [65, 45, 75, 55, 85, 60, 70],
      mockHorizontalData: [85, 65, 55, 45, 35],
      mockPerformanceData: [25, 45, 65, 85, 55, 35],
      mockActivityData: [20, 40, 60, 80, 75, 55, 35, 45]
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    generateReport() {
      this.isLoading = true;
      
      // Simulate API call with timeout
      setTimeout(() => {
        this.isLoading = false;
        this.toast.success(`Generated ${this.selectedReportType} report for ${this.selectedTimePeriod} period`);
      }, 1500);
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.dashboard-main {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
}

.page-info {
  max-width: 60%;
  margin-bottom: 20px;
}
  .page-description {
    color: #7f8c8d;
    font-size: 14px;
  }

  .page-title {
    color: #2c3e50;
    font-size: 24px;
    font-weight: 600;
  }

/* Report Filters */
.report-filters {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.filter-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: white;
  min-width: 200px;
}

.generate-btn {
  padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s;
}

.generate-btn:hover {
  background-color: #0056b3;
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BF6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Report Section Styles */
.report-section {
  margin-bottom: 30px;
}

.stats-cards {
  display: flex;
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  flex: 1;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin-bottom: 10px;
}

.stat-change {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.positive {
  color: #28a745;
}

.negative {
  color: #dc3545;
}

/* Chart Styles */
.chart-container {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.chart-container h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.chart-placeholder {
  height: 250px;
  border: 1px dashed #ddd;
  border-radius: 5px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.mock-chart {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  height: 200px;
  padding: 20px;
}

.bar {
  width: 30px;
  background-color: #007BF6;
  border-radius: 3px 3px 0 0;
}

.mock-chart.horizontal {
  flex-direction: column;
  align-items: flex-start;
  height: auto;
  gap: 15px;
}

.h-bar {
  height: 25px;
  background-color: #007BF6;
  border-radius: 0 3px 3px 0;
}

/* Table Styles */
.data-table {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.data-table h3 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  color: #666;
  font-size: 14px;
  font-weight: 600;
}

td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
  color: #333;
  font-size: 14px;
}

/* Export Section */
.export-section {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.export-btn {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
}

.export-btn:hover {
  background-color: #e9ecef;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .stats-cards, .report-filters {
    flex-direction: column;
  }
  
  .filter-group select {
    min-width: auto;
    width: 100%;
  }
}
</style> 