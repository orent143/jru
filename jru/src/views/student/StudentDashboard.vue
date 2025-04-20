<template>
  <div class="dashboard-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="dashboard-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="dashboard-main">
        <div class="welcome-section">
          <div class="welcome-text">
            <h1>Welcome back, {{ student?.name || 'Student' }}!</h1>
            <p>{{ currentDateFormatted }}</p>
            <p class="welcome-subtext">We're glad to have you here. Explore your dashboard to see what's coming up next!</p>
          </div>

          <div class="welcome-image">
            <img src="@/assets/1628609.png" alt="Welcome Image" />
          </div>

        </div>

        <div class="dashboard-grid">
          <!-- Stats Section -->
          <div class="stats-section">
            <div class="stat-card">
              <div class="stat-icon courses">
                <i class="pi pi-book"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ courses.length || 0 }}</span>
                <span class="stat-label">Courses</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon assignments">
                <i class="pi pi-file-edit"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ totalAssignments }}</span>
                <span class="stat-label">Assignments</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon quizzes">
                <i class="pi pi-check-square"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ totalQuizzes }}</span>
                <span class="stat-label">Quizzes</span>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon exams">
                <i class="pi pi-file"></i>
              </div>
              <div class="stat-info">
                <span class="stat-value">{{ totalExams }}</span>
                <span class="stat-label">Exams</span>
              </div>
            </div>
          </div>

          <!-- Upcoming Events Section -->
          <div class="events-section">
            <div class="section-header">
              <h2>Upcoming Events</h2>
              <button class="view-all-btn" @click="navigateToCalendar">View All</button>
            </div>
            <div v-if="isLoading" class="loading-indicator">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Loading events...</span>
            </div>
            <div v-else-if="upcomingEvents.length === 0" class="no-events">
              <i class="pi pi-calendar-times"></i>
              <p>No upcoming events</p>
            </div>
            <div v-else class="events-list">
              <div v-for="event in upcomingEvents" :key="event.event_id" class="event-item" :class="event.type || 'other'">
                <div class="event-date">
                  <span class="event-day">{{ formatEventDay(event.date) }}</span>
                  <span class="event-month">{{ formatEventMonth(event.date) }}</span>
                </div>
                <div class="event-details">
                  <h4 class="event-title">{{ event.title }}</h4>
                  <p class="event-course">{{ event.course_name || 'General' }}</p>
                  <span class="event-type-badge" :class="event.type">{{ formatEventType(event.type || 'other') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Courses Section -->
          <div class="courses-section">
            <div class="section-header">
              <h2>My Courses</h2>
              <button class="view-all-btn" @click="navigateToCourses">View All</button>
            </div>
            <div v-if="isLoading" class="loading-indicator">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Loading courses...</span>
            </div>
            <div v-else-if="courses.length === 0" class="no-courses">
              <i class="pi pi-book"></i>
              <p>No courses available</p>
            </div>
            <div v-else class="courses-list">
              <div v-for="course in courses.slice(0, 4)" :key="course.course_id" 
                   class="course-item" @click="navigateToCourse(course.course_id)">
                <div class="course-icon">
                  <i class="pi pi-book"></i>
                </div>
                <div class="course-details">
                  <h4 class="course-title">{{ course.course_name }}</h4>
                  <p class="course-info">{{ course.section || 'No section' }}</p>
                  <p class="course-schedule">{{ course.class_schedule || 'Schedule not available' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity Section -->
          <div class="activity-section">
            <div class="section-header">
              <h2>Recent Activity</h2>
            </div>
            <div v-if="isLoading" class="loading-indicator">
              <i class="pi pi-spin pi-spinner"></i>
              <span>Loading activity...</span>
            </div>
            <div v-else-if="recentActivities.length === 0" class="no-activity">
              <i class="pi pi-history"></i>
              <p>No recent activity</p>
            </div>
            <div v-else class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <i :class="getActivityIcon(activity.type)"></i>
                </div>
                <div class="activity-details">
                  <h4 class="activity-title">{{ activity.title }}</h4>
                  <p class="activity-description">{{ activity.description }}</p>
                  <span class="activity-time">{{ formatActivityTime(activity.time) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/student/Sidebar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'StudentDashboard',
  components: {
    Header,
    Sidebar
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      student: null,
      courses: [],
      upcomingEvents: [],
      recentActivities: [],
      searchQuery: '',
      isSidebarCollapsed: false,
      isLoading: true,
      currentDate: new Date()
    };
  },
  computed: {
    currentDateFormatted() {
      return this.currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    totalAssignments() {
      return this.courses.reduce((total, course) => {
        return total + (course.assignments ? course.assignments.length : 0);
      }, 0);
    },
    totalQuizzes() {
      return this.courses.reduce((total, course) => {
        return total + (course.quizzes ? course.quizzes.length : 0);
      }, 0);
    },
    totalExams() {
      return this.courses.reduce((total, course) => {
        return total + (course.exams ? course.exams.length : 0);
      }, 0);
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    async fetchStudentData() {
      try {
        this.isLoading = true;
        const storedUser = JSON.parse(localStorage.getItem('user'));
        
        if (!storedUser || storedUser.role !== 'student') {
          this.toast.error('User is not authenticated or not a student');
          this.$router.push('/login');
          return;
        }
        
        this.student = storedUser;
        
        // Fetch courses
        const coursesResponse = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.student.user_id}`);
        this.courses = coursesResponse.data.courses || [];
        
        // Fetch course details including assignments, quizzes, and exams
        await this.fetchCourseDetails();
        
        // Fetch events
        await this.fetchEvents();
        
        // Fetch activities (mock data for now)
        this.generateMockActivities();
        
      } catch (error) {
        console.error('Error fetching student data:', error);
        this.toast.error('Failed to load dashboard data');
      } finally {
        this.isLoading = false;
      }
    },
    async fetchCourseDetails() {
      try {
        const detailPromises = this.courses.map(async (course) => {
          // Fetch assignments
          try {
            const assignmentsResponse = await axios.get(
              `http://127.0.0.1:8000/api/student_assignments/${this.student.user_id}/${course.course_id}`
            );
            course.assignments = assignmentsResponse.data.assignments || [];
          } catch (err) {
            console.error(`Error fetching assignments for course ${course.course_id}:`, err);
            course.assignments = [];
          }
          
          // Fetch quizzes
          try {
            const quizzesResponse = await axios.get(
              `http://127.0.0.1:8000/api/student_quizzes/${this.student.user_id}/${course.course_id}`
            );
            course.quizzes = quizzesResponse.data.quizzes || [];
          } catch (err) {
            console.error(`Error fetching quizzes for course ${course.course_id}:`, err);
            course.quizzes = [];
          }
          
          // Fetch exams
          try {
            const examsResponse = await axios.get(
              `http://127.0.0.1:8000/api/student_exams/${this.student.user_id}/${course.course_id}`
            );
            course.exams = examsResponse.data.exams || [];
          } catch (err) {
            console.error(`Error fetching exams for course ${course.course_id}:`, err);
            course.exams = [];
          }
          
          return course;
        });
        
        await Promise.all(detailPromises);
      } catch (error) {
        console.error('Error fetching course details:', error);
      }
    },
    async fetchEvents() {
      try {
        let allEvents = [];
        
        if (this.courses && this.courses.length > 0) {
          const eventPromises = this.courses.map(course => 
            axios.get(`http://127.0.0.1:8000/api/events/course/${course.course_id}`)
              .then(response => {
                const events = response.data || [];
                return events.map(event => ({
                  ...event,
                  course_name: course.course_name
                }));
              })
              .catch(error => {
                console.error(`Error fetching events for course ${course.course_id}:`, error);
                return []; 
              })
          );
          
          const eventsArrays = await Promise.all(eventPromises);
          allEvents = eventsArrays.flat();
        }
        
        // Sort by date and get upcoming events
        const now = new Date();
        this.upcomingEvents = allEvents
          .filter(event => new Date(event.date) >= now)
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .slice(0, 5);
          
      } catch (error) {
        console.error('Error fetching events:', error);
        this.toast.error('Failed to load events');
        this.upcomingEvents = [];
      }
    },
    generateMockActivities() {
      // Generate mock activities for demonstration
      const types = ['assignment', 'quiz', 'exam', 'grade', 'announcement'];
      const activities = [];
      
      for (let i = 0; i < 5; i++) {
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomHours = Math.floor(Math.random() * 72);
        const time = new Date(Date.now() - randomHours * 60 * 60 * 1000);
        
        let title, description;
        
        switch (randomType) {
          case 'assignment':
            title = 'Assignment Submitted';
            description = 'You submitted "Research Paper" for Programming 2';
            break;
          case 'quiz':
            title = 'Quiz Completed';
            description = 'You scored 85% on "Chapter 5 Quiz" in Database Systems';
            break;
          case 'exam':
            title = 'Exam Scheduled';
            description = 'Midterm Exam for Web Development scheduled for next Monday';
            break;
          case 'grade':
            title = 'Grade Updated';
            description = 'Your grade for "Assignment 3" has been updated';
            break;
          case 'announcement':
            title = 'New Announcement';
            description = 'Important announcement about the schedule change for Information Security';
            break;
        }
        
        activities.push({
          id: i + 1,
          type: randomType,
          title,
          description,
          time
        });
      }
      
      // Sort by time (most recent first)
      this.recentActivities = activities.sort((a, b) => b.time - a.time);
    },
    formatEventDay(dateString) {
      const date = new Date(dateString);
      return date.getDate();
    },
    formatEventMonth(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short' });
    },
    formatEventType(type) {
      const typeMap = {
        'class': 'Class',
        'exam': 'Exam',
        'quiz': 'Quiz',
        'assignment': 'Assignment',
        'meeting': 'Meeting',
        'holiday': 'Holiday',
        'deadline': 'Deadline',
        'other': 'Event'
      };
      
      return typeMap[type] || 'Event';
    },
    formatActivityTime(time) {
      const now = new Date();
      const activityTime = new Date(time);
      const diffMs = now - activityTime;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      } else if (diffMins > 0) {
        return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    },
    getActivityIcon(type) {
      const iconMap = {
        'assignment': 'pi pi-file-edit',
        'quiz': 'pi pi-check-square',
        'exam': 'pi pi-file',
        'grade': 'pi pi-chart-bar',
        'announcement': 'pi pi-bell'
      };
      
      return iconMap[type] || 'pi pi-info-circle';
    },
    navigateToCourse(courseId) {
      this.$router.push({
        name: 'StudentCourseContent',
        params: { courseId: courseId.toString() }
      });
    },
    navigateToCourses() {
      this.$router.push({ name: 'Courses' });
    },
    navigateToCalendar() {
      this.$router.push({ name: 'StudentCalendar' });
    },
    navigateToGrades() {
      this.$router.push({ name: 'GradeDashboard' });
    }
  },
  mounted() {
    this.fetchStudentData();
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
  padding: 2rem;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, #007BF6, #0056b3);
  padding: 1.5rem 2rem;
  border-radius: 10px;
  box-shadow: 0 10px 8px #0000003b;
  flex-wrap: wrap;
}

.welcome-text {
  flex: 1;
  color: #ffffff;
  margin-right: 2rem;
}


.welcome-text h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  font-weight: 700;
}


.welcome-text p {
  margin: 0.25rem 0;
}

.welcome-subtext {
  font-size: 1rem;
  margin-top: 1rem;
  max-width: 450px;
  line-height: 1.4;
}

.welcome-image {
  flex: 0 0 200px;
  display: flex;
  justify-content: flex-end;
}

.welcome-image img {
  max-width: 180px;
  height: auto;
}

.quick-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.75rem 1.25rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.action-btn:hover {
  background-color: #0069d9;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto auto;
  gap: 1.5rem;
}

/* Stats Section */
.stats-section {
  grid-column: span 12;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 8px rgba(0, 0, 0, 0.123);
  border-top: 4px solid #007BF6;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.stat-icon i {
  font-size: 1.5rem;
  color: #007BF6;
}

.stat-icon.courses {
  background-color: rgba(0, 123, 246, 0.1);
}

.stat-icon.assignments {
  background-color: rgba(0, 123, 246, 0.1);
}

.stat-icon.quizzes {
  background-color: rgba(0, 123, 246, 0.1);
}

.stat-icon.exams {
  background-color: rgba(0, 123, 246, 0.1);
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
}

.stat-label {
  color: #6c757d;
  font-size: 0.9rem;
}

/* Events Section */
.events-section {
  grid-column: span 6;
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* Courses Section */
.courses-section {
  grid-column: span 6;
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

/* Activity Section */
.activity-section {
  grid-column: span 12;
  background-color: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 10px 8px rgba(0, 0, 0, 0.05);
  border-top: 4px solid #007BF6;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  font-size: 1.3rem;
  color: #2c3e50;
  margin: 0;
  font-weight: 600;
}

.view-all-btn {
  background: none;
  border: none;
  color: #007BF6;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.view-all-btn:hover {
  text-decoration: underline;
}

/* Events List */
.events-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 350px;
  overflow-y: auto;
}

.event-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  border-left: 4px solid #007BF6;
}

.event-item.exam {
  border-left-color: #dc3545;
}

.event-item.quiz {
  border-left-color: #fd7e14;
}

.event-item.assignment {
  border-left-color: #28a745;
}

.event-item.meeting {
  border-left-color: #6610f2;
}

.event-date {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 1rem;
  min-width: 50px;
}

.event-day {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.event-month {
  font-size: 0.9rem;
  color: #6c757d;
}

.event-details {
  flex: 1;
}

.event-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.event-course {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.event-type-badge {
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 20px;
  font-weight: 500;
  display: inline-block;
}

.event-type-badge.class {
  background-color: #e6f2ff;
  color: #007BF6;
}

.event-type-badge.exam {
  background-color: #ffebee;
  color: #dc3545;
}

.event-type-badge.quiz {
  background-color: #fff3e0;
  color: #fd7e14;
}

.event-type-badge.assignment {
  background-color: #e8f5e9;
  color: #28a745;
}

.event-type-badge.meeting {
  background-color: #f5e9ff;
  color: #6610f2;
}

/* Courses List */
.courses-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.course-item {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.course-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #007BF6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.course-icon i {
  color: white;
  font-size: 1.2rem;
}

.course-details {
  flex: 1;
  overflow: hidden;
}

.course-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.course-info, .course-schedule {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Activity List */
.activity-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.activity-item {
  display: flex;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
}

.activity-icon i {
  color: #007BF6;
  font-size: 1rem;
}

.activity-icon.assignment {
  background-color: rgba(0, 123, 246, 0.1);
}

.activity-icon.quiz {
  background-color: rgba(0, 123, 246, 0.1);
}

.activity-icon.exam {
  background-color: rgba(0, 123, 246, 0.1);
}

.activity-icon.grade {
  background-color: rgba(0, 123, 246, 0.1);
}

.activity-icon.announcement {
  background-color: rgba(0, 123, 246, 0.1);
}

.activity-details {
  flex: 1;
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.25rem 0;
}

.activity-description {
  font-size: 0.8rem;
  color: #6c757d;
  margin: 0 0 0.5rem 0;
}

.activity-time {
  font-size: 0.75rem;
  color: #adb5bd;
}

/* Loading and Empty States */
.loading-indicator, .no-events, .no-courses, .no-activity {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
  text-align: center;
}

.loading-indicator i, 
.no-events i, 
.no-courses i, 
.no-activity i {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: #adb5bd;
}

/* Responsive Styles */
@media (max-width: 1200px) {
  .stats-section {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .events-section, .courses-section {
    grid-column: span 12;
  }
  
  .courses-list {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .activity-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-image {
    margin-top: 1rem;
    justify-content: center;
    width: 100%;
  }

  .welcome-image img {
    max-width: 100%;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .courses-list, .activity-list {
    grid-template-columns: 1fr;
  }
}
</style>
