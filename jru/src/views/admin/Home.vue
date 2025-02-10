<template>
    <div class="dashboard-container">
      <Header :user="user" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      
      <div class="dashboard-content">
        <SideBar :isCollapsed="isSidebarCollapsed" />
        
        <main class="dashboard-main">
          <div class="system-overview-container">
            <table>
              <thead>
                <tr>
                  <th>Total Users</th>
                  <th>Active Courses</th> 
                  <th>System Health</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>1,234</td>
                  <td>56</td>
                  <td>98%</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <div class="action-cards">
            <router-link to="/user-management" class="card">
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
                    <td>{{task.priority}}</td>
                    <td>{{task.status}}</td>
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
          // Add sample notifications
        ],
        pendingTasks: [
          // Add sample tasks
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
    color: #333;
    background-color: #fff;
}

.container {
    margin-bottom: 20px;
    padding: 20px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.una-container {
    margin-bottom: 40px;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.una-container table {
    width: 100%;
    border-collapse: collapse;
}

.una-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000;
    font-size: 23px;
    font-weight: bold;
}
.una-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000000e1;
    font-size: 17px;
}
a, .green {
    text-decoration: none;
    color: #007BF6;
    transition: 0.4s;
    padding: 3px;
}
tbody  {
    background-color: #ffffff;
    border-radius: 20px;
}
h1, h2 {
    color: #333;
    display: flex;
}

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

.side-by-side {
    display: flex;
    gap: 20px;
}

.upcoming-class-container, .submissions-container {
    flex: 1;
    background-color: #D9D9D9;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
.upcoming-class-container table,
.submissions-container table {
    width: 100%;
    border-collapse: collapse;
}
.upcoming-class-container, .submissions-container, h2{
    margin-left: 15px;
}
.upcoming-class-container th,
.submissions-container th {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #000;
    font-size: 18px;
    font-weight: bold;
}

.upcoming-class-container td,
.submissions-container td {
    padding: 10px;
    text-align: left;
    border-bottom: 1px solid #ddd;
    color: #333;
    font-size: 16px;
}

.upcoming-class-container tbody,
.submissions-container tbody {
    background-color: #fff;
}

  /* Keep existing styles and add/modify as needed */
  .system-overview-container {
    background-color: #D9D9D9;
    border-radius: 10px;
    margin-bottom: 40px;
  }
  
  .notifications-container, 
  .tasks-container {
    flex: 1;
    background-color: #D9D9D9;
    border-radius: 10px;
  }
  
  /* Rest of the styles remain the same */
  </style>