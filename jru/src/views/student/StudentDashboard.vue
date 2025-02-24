<template>
  <div class="dashboard-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="dashboard-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="dashboard-main">
        <section class="course-cards">
          <div class="course-card" 
               v-for="course in courses" 
               :key="course.course_id" 
               @click="navigateToCourse(course.course_id)">
            <div class="card-header">
              <h4>{{ course.course_name }}</h4>
              <p>{{ course.section }}</p>
            </div>
            <div class="schedule-container">
              <p>Schedule: {{ course.class_schedule }}</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import Header from '@/components/student/Header.vue';
import Sidebar from '@/components/student/Sidebar.vue';
import axios from 'axios';

export default {
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      courses: [],
      studentId: null,
      isSidebarCollapsed: false,
    };
  },
  async created() {
    await this.fetchStudentCourses();
  },
  methods: {
    async fetchStudentCourses() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'student') {
          this.studentId = storedUser.user_id;
          const response = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.studentId}`);
          this.courses = response.data.courses;
        } else {
          console.error("User is not authenticated or not a student");
        }
      } catch (error) {
        console.error("Error fetching student courses:", error);
      }
    },
    navigateToCourse(courseId) {
      this.$router.push({ name: 'StudentCourseContent', params: { courseId } });
    }
  }
};
</script>




<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height of the viewport */
  overflow: hidden; /* Prevents overflow in the container itself */
}

.dashboard-content {
  display: flex;
  flex: 1; /* Take up the remaining space */
  overflow: hidden; /* Prevents overflow in the content area */
}

.dashboard-main {
  flex: 1; /* Main area should take the remaining space */
  padding: 2rem;
  overflow-y: auto; /* Allow scrolling if content overflows */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling for iOS */
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 items per row */
  gap: 4rem; /* Adds space between cards */
}

.course-card {
  background-color: #D9D9D9ff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 95%;
  height: auto;
  cursor: pointer; /* Change the cursor to a pointer to indicate the card is clickable */
  transition: transform 0.2s, box-shadow 0.2s; /* Add a transition effect for hover */
}

.course-card:hover {
  transform: scale(1.05); /* Slightly increase the size of the card on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Add a shadow to the card on hover */
}

.course-info, .announcements-container {
  flex-grow: 1; /* Allows both containers to grow and take available space */
}

.course-info {
  background-color: #D9D9D9ff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    width: 95%;
    height: auto;
    cursor: pointer; /* Change the cursor to a pointer to indicate the card is clickable */
    transition: transform 0.2s, box-shadow 0.2s; /* Add a transition effect for hover */
}

.course-name {
  font-size: 25px;
  font-weight: 900;
  color: #000;
}
.card-header {
  position: relative; /* Needed for absolute positioning of card actions */
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
}

.card-header h4 {
    font-size: 25px;
    font-weight: 900;
    color: #000;
}

.card-header p {
    font-size: 16px;
    color: #666;
}


.schedule-container {
  background-color: #F5F5F5;
    padding: 1rem;
    padding-top: 0%;
    border-radius: 8px;
    border-top-left-radius: 0px;
    border-top-right-radius: 0px;
    display: flex;
    flex-direction: column;
    min-height: 100px;
}

.schedule-container p {
    color: #000;
}

.announcements li {
  margin-bottom: 0.5rem;
  color: #333;
}

.announcement-message {
  font-size: 1rem;
  color: #000;
  display: block;
  margin-top: 0.3rem;
}

.quick-links ul {
  list-style-type: none;
}

.quick-links li {
  margin-bottom: 0.5rem;
}

.quick-links a {
  color: #007bff;
}
</style>