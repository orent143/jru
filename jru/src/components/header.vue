<template>
  <header class="dashboard-header">
    <div class="header-content">
      <div class="header-left">
        <button class="sidebar-toggle" @click="toggleSidebar">☰</button>
        <div class="logo">
          <span class="logo-text">JRU</span>
        </div>
      </div>
      <div class="header-right">
        <div class="profile">
          <i class="pi pi-bell notification-icon"></i>
          <div class="profile-dropdown" @click="toggleProfileModal">
            <i class="pi pi-user profile-icon"></i>
            <span class="user-name">{{ user?.name || 'User' }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Profile Modal -->
    <ProfileModal 
      v-if="isProfileModalOpen" 
      :user="user" 
      :isProfileModalOpen="isProfileModalOpen"
      @close="toggleProfileModal" 
    />
  </header>
</template>

<script>
import ProfileModal from "@/views/Profile.vue";

export default {
  components: { ProfileModal },
  props: {
    searchQuery: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      user: null,
      isProfileModalOpen: false
    };
  },
  methods: {
    toggleSidebar() {
      this.$emit("toggleSidebar");
    },
    updateSearchQuery() {
      this.$emit("update:searchQuery", this.localSearchQuery);
    },
    toggleProfileModal() {
      this.isProfileModalOpen = !this.isProfileModalOpen;
    }
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.user = JSON.parse(userData);
    }
  }
};
</script>
  

<style scoped>
.dashboard-header {
  position: sticky;
  top: 0;
  background-color: #D9D9D9;
  padding: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between; /* Ensure space between left and right sections */
}

.header-left {
  display: flex;
  align-items: center; /* Align toggle and logo vertically */
}

.sidebar-toggle {
  color: rgba(0, 0, 0, 0.932); /* Text color */
  background-color: transparent; /* Transparent background */
  border: none; /* Remove border */
  padding: 0px; /* Padding for the button */
  cursor: pointer; /* Pointer cursor on hover */
  font-size: 25px; /* Font size for the toggle icon */
  font-weight: 900;
  transition: background-color 0.3s; /* Smooth transition */
}

.sidebar-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1); /* Light background on hover */
}

.logo {
  display: flex;
  margin-left: 10px; /* Add some spacing from the toggle button */
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 16px;
  pointer-events: none;
}

.search-bar input {
  padding: 8px 12px 8px 40px;
  border: 1px solid #ddd;
  border-radius: 8px;
  width: 200px;
  font-size: 14px;
  color: #333;
  background-color: #F5F5F5;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  border-color: #007BF6;
  background-color: white;
  box-shadow: 0 0 0 2px rgba(0, 123, 246, 0.1);
  outline: none;
}

.profile {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.notification-icon {
  color: #666;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.notification-icon:hover {
  color: #007BF6;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
}

.profile-icon {
  color: #666;
  font-size: 18px;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.logo-text {
  font-family: 'Inknut Antiqua', serif;
  font-size: 30px; /* Increase the font size to make the logo text bigger */
  font-weight: bolder;
  color: white;
  text-shadow: 
    1px 1px 0 #034694, 
    -1px 1px 0 #034694,
    1px -1px 0 #034694,
    -1px -1px 0 #034694,
    0px 1px 0 #034694,
    0px -1px 0 #034694,
    1px 0px 0 #034694,
    -1px 0px 0 #034694;
  line-height: 1.2; /* Adjust line-height for better spacing */
}
</style>