<template>
    <div class="dashboard-container">
      <Header :user="user" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      
      <div class="dashboard-content">
        <SideBar :isCollapsed="isSidebarCollapsed" />
        
        <main class="dashboard-main">
          <div class="system-overview-container">
            <<table class="system-table">
  <thead>
    <tr>
      <th>Total Users</th>
      <th>Active Courses</th>
      <th>Faculty</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1,234</strong></td>
      <td><strong>56</strong></td>
      <td><strong>32</strong></td>
    </tr>
  </tbody>
</table>
          </div>
  
          <div class="action-cards">
            <router-link to="/users" class="card">
              <h3>User Management</h3>
            </router-link>
            <router-link to="/course-management" class="card">
              <h3>Course Management</h3>
            </router-link>
            <router-link to="/reports" class="card">
              <h3>Reports & Analytics</h3>
            </router-link>
            <router-link to="/settings" class="card">
              <h3>System Settings</h3>
            </router-link>
          </div>
  
          <div class="side-by-side">
            <div class="notifications-container">
              <h2>Recent Notifications</h2>
              <table>
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
              <table>
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
  import Header from '@/components/admin/header.vue';
  import SideBar from '@/components/admin/sidebar.vue';
  
  export default {
    name: 'AdminDashboard',
    components: {
      Header,
      SideBar,
    },
    data() {
      return {
        searchQuery: '',
        user: {
          name: 'Admin User',
          role: 'admin'
        },
        isSidebarCollapsed: false,
        notifications: [
        {
          id: 1,
          type: 'New User',
          message: 'Lorenzzz registered as a student',
          time: '2 hours ago'
        },
        {
          id: 2,
          type: 'Course',
          message: 'New course ITELECT4 was added',
          time: '3 hours ago'
        },
        {
          id: 3,
          type: 'System',
          message: 'System maintenance scheduled',
          time: '5 hours ago'
        },
        {
          id: 4,
          type: 'Alert',
          message: 'High server load detected',
          time: '6 hours ago'
        }
      ],
      
      // Pending Tasks dummy data
      pendingTasks: [
        {
          id: 1,
          name: 'Review Course Proposals',
          priority: 'High',
          status: 'Pending'
        },
        {
          id: 2,
          name: 'Update System Settings',
          priority: 'Medium',
          status: 'In Progress'
        },
        {
          id: 3,
          name: 'Backup Database',
          priority: 'Low',
          status: 'Scheduled'
        },
        {
          id: 4,
          name: 'User Account Approvals',
          priority: 'High',
          status: 'Pending'
        }
      ]
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }
};
</script>
  
  <style scoped>
  .dashboard-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .dashboard-content {
    display: flex;
    flex-grow: 1;
  }
  
  .dashboard-main {
    flex-grow: 1;
    padding: 20px;
    background-color: #fff;
  }
  
  /* System Overview Section */
  .system-overview-container {
    margin-bottom: 40px;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .system-overview-container table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .system-overview-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000;
    font-size: 23px;
    font-weight: bold;
  }
  
  .system-overview-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000e1;
    font-size: 17px;
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
    padding: 17px;
    background-color: #007BF6;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    text-align: center;
    text-decoration: none;
  }
  
  .card h3 {
    color: #fff;
  }
  
  /* Side by Side Containers */
  .side-by-side {
    display: flex;
    gap: 20px;
  }
  
  .notifications-container,
  .tasks-container {
    flex: 1;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .notifications-container table,
  .tasks-container table {
    width: 100%;
    border-collapse: collapse;
  }
  
  .notifications-container h2,
  .tasks-container h2 {
    margin-left: 15px;
    color: #333;
    display: flex;
  }
  
  .notifications-container th,
  .tasks-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000;
    font-size: 18px;
    font-weight: bold;
  }
  
  .notifications-container td,
  .tasks-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #333;
    font-size: 16px;
  }
  
  .notifications-container tbody,
  .tasks-container tbody {
    background-color: #fff;
    border-radius: 20px;
  }
  
  /* Status and Priority Badges */
  .status,
  .priority {
    padding: 5px 10px;
    border-radius: 15px;
    font-size: 12px;
    font-weight: 500;
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
  
  /* Links */
  a {
    text-decoration: none;
    color: #007BF6;
    transition: 0.4s;
    padding: 3px;
  }
  
  /* General Table Styles */
  tbody {
    background-color: #ffffff;
    border-radius: 20px;
  }
  </style>