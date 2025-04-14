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
          <div class="notification-wrapper">
            <i class="pi pi-bell notification-icon" @click="toggleNotifications"></i>
            <span v-if="unreadNotifications.length > 0" class="notification-badge">{{ unreadNotifications.length }}</span>
            
            <div v-if="showNotifications" class="notification-dropdown">
              <div class="notification-header">
                <h3>Notifications</h3>
                <span v-if="notifications.length > 0" class="mark-all-read" @click="markAllAsRead">
                  Mark all as read
                </span>
              </div>
              
              <div v-if="notifications.length === 0" class="empty-notifications">
                No notifications at this time
              </div>
              
              <div v-else class="notification-list">
                <div 
                  v-for="(notification, index) in notifications" 
                  :key="index" 
                  class="notification-item"
                  :class="{ 'unread': !notification.read }"
                  @click="handleNotificationClick(notification)"
                >
                  <div class="notification-icon-wrapper" :class="notification.type">
                    <i :class="getNotificationIcon(notification.type)"></i>
                  </div>
                  <div class="notification-content">
                    <div class="notification-title">{{ notification.title }}</div>
                    <div class="notification-message">{{ notification.message }}</div>
                    <div class="notification-time">{{ formatNotificationTime(notification.time) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="profile-dropdown" @click="toggleProfileModal">
            <i class="pi pi-user profile-icon"></i>
            <span class="user-name">{{ user?.name || 'User' }}</span>
          </div>
        </div>
      </div>
    </div>

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
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  components: { ProfileModal },
  props: {
    searchQuery: {
      type: String,
      default: ""
    },
    student: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      localSearchQuery: this.searchQuery,
      user: null,
      isProfileModalOpen: false,
      showNotifications: false,
      notifications: [],
      lastChecked: null
    };
  },
  computed: {
    unreadNotifications() {
      return this.notifications.filter(notification => !notification.read);
    }
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
    },
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      if (!this.showNotifications) {
        this.lastChecked = new Date();
        localStorage.setItem('lastNotificationCheck', this.lastChecked.toISOString());
      }
    },
    getNotificationIcon(type) {
      const iconMap = {
        'event': 'pi pi-calendar',
        'assignment': 'pi pi-file',
        'quiz': 'pi pi-list',
        'exam': 'pi pi-exclamation-triangle',
        'class': 'pi pi-clock',
        'system': 'pi pi-info-circle'
      };
      return iconMap[type] || 'pi pi-bell';
    },
    formatNotificationTime(time) {
      const date = new Date(time);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString();
    },
    async fetchNotifications() {
      try {
        if (!this.user) return;
        
        const storedNotifications = localStorage.getItem('notifications');
        if (storedNotifications) {
          this.notifications = JSON.parse(storedNotifications);
        }
        
        if (this.user.role === 'student') {
          await this.fetchStudentEventNotifications();
        }
        else if (this.user.role === 'faculty') {
          await this.fetchFacultyNotifications();
        }
        
        this.notifications.sort((a, b) => new Date(b.time) - new Date(a.time));
        
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
      } catch (error) {
        console.error('Error fetching notifications:', error);
        
        // Add a fallback notification if there are no notifications
        if (this.notifications.length === 0) {
          const notificationType = this.user?.role === 'student' ? 'student-welcome' : 'system-welcome';
          const notificationTitle = this.user?.role === 'student' ? 'Welcome to Student Dashboard' : 
                                  (this.user?.role === 'faculty' ? 'Welcome to Faculty Dashboard' : 'Welcome to JRU Dashboard');
          
          this.notifications.push({
            id: notificationType,
            title: notificationTitle,
            message: 'Welcome to your personalized dashboard. Your activities will appear here.',
            time: new Date().toISOString(),
            read: false,
            type: 'system'
          });
        }
      }
    },
    async fetchStudentEventNotifications() {
      try {
        const courseResponse = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.user.user_id}`);
        
        if (courseResponse.data && courseResponse.data.courses) {
          const courses = courseResponse.data.courses;
          
          for (const course of courses) {
            try {
              const eventsResponse = await axios.get(`http://127.0.0.1:8000/api/events/course/${course.course_id}`);
              
              if (eventsResponse.data && eventsResponse.data.length > 0) {
                const now = new Date();
                const nextWeek = new Date();
                nextWeek.setDate(nextWeek.getDate() + 7);
                
                const upcomingEvents = eventsResponse.data.filter(event => {
                  const eventDate = new Date(event.date);
                  return eventDate >= now && eventDate <= nextWeek;
                });
                
                for (const event of upcomingEvents) {
                  const existingNotif = this.notifications.find(n => 
                    n.eventId === event.event_id && n.type === event.type
                  );
                  
                  if (!existingNotif) {
                    this.notifications.push({
                      id: `event-${event.event_id}`,
                      title: `Upcoming ${event.type}: ${event.title}`,
                      message: `${event.course_name} - ${new Date(event.date).toLocaleDateString()}`,
                      time: new Date().toISOString(),
                      read: false,
                      type: event.type,
                      eventId: event.event_id,
                      courseId: event.course_id,
                      date: event.date
                    });
                  }
                }
              }
            } catch (eventError) {
              console.warn(`Could not fetch events for course ${course.course_id}:`, eventError);
              // Continue with next course even if one fails
            }
          }
        }
      } catch (error) {
        console.error('Error fetching student event notifications:', error);
        
        // Add fallback notification if there are no courses
        if (!this.notifications.find(n => n.id === 'student-welcome')) {
          this.notifications.push({
            id: 'student-welcome',
            title: 'Welcome to Student Dashboard',
            message: 'You can view your courses and upcoming assignments here.',
            time: new Date().toISOString(),
            read: false,
            type: 'system'
          });
        }
      }
    },
    async fetchFacultyNotifications() {
      try {
        const existingNotif = this.notifications.find(n => n.id === 'faculty-welcome');
        
        if (!existingNotif) {
          this.notifications.push({
            id: 'faculty-welcome',
            title: 'Welcome to Faculty Dashboard',
            message: 'You can manage your courses and view upcoming classes here.',
            time: new Date().toISOString(),
            read: false,
            type: 'system'
          });
        }
      } catch (error) {
        console.error('Error fetching faculty notifications:', error);
      }
    },
    markAllAsRead() {
      this.notifications = this.notifications.map(notification => ({
        ...notification,
        read: true
      }));
      
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },
    handleNotificationClick(notification) {
      notification.read = true;
      
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
      
      if (notification.type === 'event' || notification.type === 'class' || 
          notification.type === 'quiz' || notification.type === 'exam' ||
          notification.type === 'assignment') {
        
        if (this.user.role === 'student') {
          if (notification.courseId) {
            this.$router.push(`/student/course/${notification.courseId}/calendar`);
          } else {
            this.$router.push('/student/calendar');
          }
        } else if (this.user.role === 'faculty') {
          this.$router.push('/faculty/calendar');
        }
      }
      
      this.showNotifications = false;
    }
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) {
      this.user = JSON.parse(userData);
      
      this.fetchNotifications();
      
      setInterval(() => {
        this.fetchNotifications();
      }, 60000);
    }
    
    document.addEventListener('click', (e) => {
      const notificationElement = this.$el.querySelector('.notification-wrapper');
      if (notificationElement && !notificationElement.contains(e.target)) {
        this.showNotifications = false;
      }
    });
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
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.sidebar-toggle {
  color: rgba(0, 0, 0, 0.932);
  background-color: transparent;
  border: none;
  padding: 0px;
  cursor: pointer;
  font-size: 25px;
  font-weight: 900;
  transition: background-color 0.3s;
}

.sidebar-toggle:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.logo {
  display: flex;
  margin-left: 10px;
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

.notification-wrapper {
  position: relative;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #dc3545;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-dropdown {
  position: absolute;
  top: 100%;
  right: -100px;
  width: 300px;
  max-height: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
  z-index: 100;
  overflow: hidden;
  margin-top: 10px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #eee;
}

.notification-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.mark-all-read {
  font-size: 12px;
  color: #007BF6;
  cursor: pointer;
}

.mark-all-read:hover {
  text-decoration: underline;
}

.empty-notifications {
  padding: 20px;
  text-align: center;
  color: #6c757d;
}

.notification-list {
  overflow-y: auto;
  max-height: 350px;
}

.notification-item {
  display: flex;
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f8f9fa;
}

.notification-item.unread {
  background-color: #f0f7ff;
}

.notification-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
}

.notification-icon-wrapper.class {
  background-color: #cce5ff;
}

.notification-icon-wrapper.class i {
  color: #007BF6;
}

.notification-icon-wrapper.assignment {
  background-color: #d4edda;
}

.notification-icon-wrapper.assignment i {
  color: #28a745;
}

.notification-icon-wrapper.quiz, .notification-icon-wrapper.exam {
  background-color: #fff3cd;
}

.notification-icon-wrapper.quiz i, .notification-icon-wrapper.exam i {
  color: #fd7e14;
}

.notification-icon-wrapper.system {
  background-color: #f8d7da;
}

.notification-icon-wrapper.system i {
  color: #dc3545;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 5px;
}

.notification-message {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 5px;
}

.notification-time {
  font-size: 11px;
  color: #adb5bd;
}

.profile-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  gap: 0.5rem;
  transition: all 0.3s ease;
  padding: 8px 12px;
  border-radius: 8px;
}

.profile-dropdown:hover {
  background-color: rgba(0, 123, 246, 0.1);
  color: #007BF6;
}

.profile-dropdown:hover .profile-icon,
.profile-dropdown:hover .user-name {
  color: #007BF6;
}

.profile-icon {
  color: #666;
  font-size: 18px;
  transition: color 0.3s ease;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  transition: color 0.3s ease;
}

.logo-text {
  font-family: 'Inknut Antiqua', serif;
  font-size: 30px;
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
  line-height: 1.2;
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
</style>