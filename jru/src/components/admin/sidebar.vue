<template>
    <aside class="sidebar" :class="{'collapsed': isCollapsed}">
      <ul>
        <li>
          <router-link to="/admin-dashboard">
            <i class="pi pi-home"></i>
            <strong>Dashboard</strong>
          </router-link>
        </li>
  
        <li>
          <router-link to="/users">
            <i class="pi pi-users"></i>
            <strong>User Management</strong>
          </router-link>
        </li>
  
        <li>
          <router-link to="/reports">
            <i class="pi pi-chart-bar"></i>
            <strong>Reports & Analytics</strong>
          </router-link>
        </li>
  
        <li>
          <router-link to="/settings">
            <i class="pi pi-cog"></i>
            <strong>System Settings</strong>
          </router-link>
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
  width: 250px;
  background: linear-gradient(180deg, #001a33 0%, #002244 100%);
  padding-top: 1.5rem;
  transition: all 0.3s ease;
  font-family: 'Roboto', sans-serif;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar.collapsed {
  width: 70px;
  transform: translateX(-100%);
}

.sidebar ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.sidebar > ul {
  padding: 0 8px;
}

.sidebar li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  gap: 5px;

}

.sidebar li:hover {
  background-color: rgba(0, 123, 246, 0.8);
  color: #ffffff;
  transform: translateX(5px);
}

.sidebar li:active {
  transform: translateX(5px) scale(0.98);
}

.sidebar li strong {
  color: #f5f5f5;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.3px;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.sidebar .dropdown-menu {
  padding-left: 25px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.sidebar .dropdown-menu.open {
  max-height: 300px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.sidebar .dropdown-menu li {
  color: #e0e0e0;
  font-size: 14px;
  padding: 8px 12px;
  margin-bottom: 3px;
  border-radius: 6px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.sidebar .dropdown-menu li:hover {
  background-color: rgba(0, 51, 85, 0.6);
  border-left: 2px solid #007bf6;
}

.sidebar li i {
  font-size: 18px;
  color: #8ca8c9;
  transition: all 0.2s ease;
  width: 24px;
  text-align: center;
}

.sidebar li:hover i {
  color: #ffffff;
}

.sidebar li:hover strong {
  color: #ffffff;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar a {
  text-decoration: none;
  color: inherit;
  width: 100%;
  display: flex;
  align-items: center;
}
</style>