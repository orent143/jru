<template>
  <div class="dashboard-container">
    <Header :user="user" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    
    <div class="dashboard-content">
      <SideBar :isCollapsed="isSidebarCollapsed" />
      
      <main class="dashboard-main">
        <div class="system-overview-container" v-if="isLoading">
          <div class="loading-spinner">Loading dashboard data...</div>
        </div>
        
        <div class="system-overview-container" v-else>
          <table class="system-table">
            <thead>
              <tr>
                <th>Total Users</th>
                <th>Active Courses</th>
                <th>Faculty</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>{{ metrics.totalUsers }}</strong></td>
                <td><strong>{{ metrics.activeCourses }}</strong></td>
                <td><strong>{{ metrics.facultyCount }}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="action-cards">
          <router-link to="/users" class="card">
            <i class="pi pi-users"></i>
            <h3>User Management</h3>
          </router-link>
          <router-link to="/course-management" class="card">
            <i class="pi pi-book"></i>
            <h3>Course Management</h3>
          </router-link>
          <router-link to="/reports" class="card">
            <i class="pi pi-chart-bar"></i>
            <h3>Reports & Analytics</h3>
          </router-link>
          <router-link to="/settings" class="card">
            <i class="pi pi-cog"></i>
            <h3>System Settings</h3>
          </router-link>
        </div>

        <div class="side-by-side">
          <div class="notifications-container">
            <h2>Recent Notifications</h2>
            <div v-if="isLoadingNotifications" class="loading-data">
              <div class="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Message</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="notification in notifications" :key="notification.id">
                  <td>{{notification.type}}</td>
                  <td>{{notification.message}}</td>
                  <td>{{notification.time}}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="tasks-container">
            <h2>Pending Tasks</h2>
            <div v-if="isLoadingTasks" class="loading-data">
              <div class="loading-spinner"></div>
              <p>Loading tasks...</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="task in pendingTasks" :key="task.id">
                  <td>{{task.name}}</td>
                  <td><span :class="['priority', `priority-${task.priority.toLowerCase()}`]">{{task.priority}}</span></td>
                  <td><span :class="['status', `status-${task.status.toLowerCase()}`]">{{task.status}}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
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
  name: 'AdminDashboard',
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
      isLoading: true,
      isLoadingNotifications: true,
      isLoadingTasks: true,
      metrics: {
        totalUsers: 0,
        activeCourses: 0,
        facultyCount: 0
      },
      notifications: [],
      pendingTasks: []
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    fetchDashboardMetrics() {
      this.isLoading = true;
      // Dummy data
      setTimeout(() => {
        this.metrics = {
          totalUsers: 1245,
          activeCourses: 45,
          facultyCount: 28
        };
        this.isLoading = false;
      }, 1000);
    },
    fetchNotifications() {
      this.isLoadingNotifications = true;
      // Dummy data
      setTimeout(() => {
        this.notifications = [
          { id: 1, type: 'User', message: 'New user registered', time: '10 mins ago' },
          { id: 2, type: 'Course', message: 'Course ITELECT2 updated', time: '1 hour ago' },
          { id: 3, type: 'System', message: 'Server restarted', time: '3 hours ago' },
          { id: 4, type: 'Alert', message: 'New login from unknown device', time: 'Yesterday' }
        ];
        this.isLoadingNotifications = false;
      }, 1000);
    },
    fetchTasks() {
      this.isLoadingTasks = true;
      // Dummy data
      setTimeout(() => {
        this.pendingTasks = [
          { id: 1, name: 'Approve new users', priority: 'High', status: 'Pending' },
          { id: 2, name: 'Fix grade calculation bug', priority: 'Medium', status: 'In Progress' },
          { id: 3, name: 'Archive inactive courses', priority: 'Low', status: 'Scheduled' },
          { id: 4, name: 'Review system logs', priority: 'High', status: 'Pending' }
        ];
        this.isLoadingTasks = false;
      }, 1000);
    }
  },
  mounted() {
    this.fetchDashboardMetrics();
    this.fetchNotifications();
    this.fetchTasks();
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
background-color: #f5f5f5;
overflow-y: auto;
}

/* Loading indicators */
.loading-spinner {
display: flex;
justify-content: center;
align-items: center;
height: 100px;
color: #666;
}

.loading-data {
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
padding: 2rem;
color: #666;
}

.loading-data .loading-spinner {
border: 3px solid #f3f3f3;
border-top: 3px solid #007BF6;
border-radius: 50%;
width: 24px;
height: 24px;
animation: spin 1s linear infinite;
margin-bottom: 0.5rem;
}

@keyframes spin {
0% { transform: rotate(0deg); }
100% { transform: rotate(360deg); }
}

/* System Overview Section */
.system-overview-container {
margin-bottom: 40px;
background-color: white;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
overflow: hidden;
}

.system-overview-container table {
width: 100%;
border-collapse: collapse;
}

.system-overview-container th {
padding: 15px;
text-align: left;
border-bottom: 1px solid #eee;
color: #333;
font-size: 18px;
font-weight: 600;
}

.system-overview-container td {
padding: 15px;
text-align: left;
color: #444;
font-size: 24px;
}

/* Action Cards */
.action-cards {
display: flex;
flex-wrap: wrap;
gap: 20px;
margin-bottom: 40px;
}

.card {
flex: 1;
min-width: 200px;
padding: 20px;
background-color: #007BF6;
border-radius: 10px;
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
text-align: center;
text-decoration: none;
transition: transform 0.2s, box-shadow 0.2s;
display: flex;
flex-direction: column;
align-items: center;
}

.card:hover {
transform: translateY(-5px);
box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.card i {
font-size: 36px;
color: white;
margin-bottom: 10px;
}

.card h3 {
color: white;
margin: 0;
font-size: 18px;
font-weight: 500;
}

/* Side by Side Containers */
.side-by-side {
display: flex;
gap: 20px;
}

.notifications-container,
.tasks-container {
flex: 1;
background-color: white;
border-radius: 10px;
box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
overflow: hidden;
}

.notifications-container table,
.tasks-container table {
width: 100%;
border-collapse: collapse;
}

.notifications-container h2,
.tasks-container h2 {
padding: 15px 20px;
margin: 0;
color: #333;
font-size: 18px;
font-weight: 600;
border-bottom: 1px solid #eee;
}

.notifications-container th,
.tasks-container th {
padding: 12px 15px;
text-align: left;
border-bottom: 1px solid #eee;
color: #666;
font-size: 14px;
font-weight: 600;
}

.notifications-container td,
.tasks-container td {
padding: 12px 15px;
text-align: left;
border-bottom: 1px solid #eee;
color: #333;
font-size: 14px;
}

/* Status and Priority Badges */
.status,
.priority {
display: inline-block;
padding: 5px 10px;
border-radius: 15px;
font-size: 12px;
font-weight: 500;
}

.status-pending {
background-color: #fff3cd;
color: #856404;
}

.status-in.progress {
background-color: #cce5ff;
color: #004085;
}

.status-scheduled {
background-color: #d1ecf1;
color: #0c5460;
}

.status-completed {
background-color: #d4edda;
color: #155724;
}

.priority-high {
background-color: #f8d7da;
color: #721c24;
}

.priority-medium {
background-color: #fff3cd;
color: #856404;
}

.priority-low {
background-color: #d1ecf1;
color: #0c5460;
}

/* Responsive adjustments */
@media (max-width: 768px) {
.side-by-side {
  flex-direction: column;
}

.action-cards {
  flex-direction: column;
}

.card {
  width: 100%;
}
}
</style> 