<template>
    <aside class="sidebar" :class="{'collapsed': isCollapsed}">
      <ul>
        <li>
          <i class="pi pi-home"></i>
          <router-link to="/admin-dashboard"><strong>Dashboard</strong></router-link>
        </li>
  
        <li>
          <i class="pi pi-users"></i>
          <router-link to="/users"><strong>User Management</strong></router-link>
        </li>

  
        <li>
          <i class="pi pi-chart-bar"></i>
          <router-link to="/analytics"><strong>Reports & Analytics</strong></router-link>
        </li>
  
        <li>
          <i class="pi pi-cog"></i>
          <router-link to="/settings"><strong>System Settings</strong></router-link>
        </li>
      </ul>
    </aside>
  </template>
  
  <script>
  export default {
    props: {
      isCollapsed: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        isUserDropdownOpen: false,
        isCourseDropdownOpen: false,
      };
    },
    methods: {
      toggleCourseDropdown() {
        this.isCourseDropdownOpen = !this.isCourseDropdownOpen;
      },
    },
  };
  </script>
  
 
<style scoped>
.sidebar {
  width: 220px;
  background-color: #002244;
  padding-top: 1rem;
  transition: width 0.3s ease, transform 0.3s ease;
  font-family: 'Roboto', sans-serif;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.884);
}

.sidebar.collapsed {
  width: 70px;
  transform: translateX(-100%);
}

.sidebar ul {
  list-style-type: none;
  padding-left: 10px;
  margin: 0;
}

.sidebar li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

.sidebar li:hover {
  background-color: #007bf6;
  width: 200px;
  color: #ffffff;
}

.sidebar li:hover i {
  color: #ffffff;
}

.sidebar li:hover strong {
  color: #ffffff;
  transform: scale(0.95);
}

.sidebar li strong {
  color: #ffffff;
  text-decoration: none;
  font-weight: 750;
  font-size: 17px;
  display: flex;
  align-items: center;
  padding: 1px 5px;
  margin: 8px;
}

.sidebar .dropdown-menu li {
  color: #ffffff;
  font-size: 13px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  padding: 3px 40px;
  margin: 7px;
}

.sidebar .dropdown-menu li:hover {
  background-color: #003355;
  width: 160px;
  color: #ffffff;
}

.sidebar li i {
  margin-right: 10px;
  transition: transform 0.3s ease;
  font-size: 20px;
  color: #ffffff;
}

.sidebar li:hover i {
  color: #ffffff;
}

.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #007bf600;
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f100;
}

.sidebar .dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}
</style>