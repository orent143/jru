<template>
  <div class="dashboard-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="dashboard-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="dashboard-main">
        <!-- Header for Assignments -->
        <div class="course-header">
          <h2>Assignments: <span>{{ totalAssignments }}</span></h2>
          
          <!-- Course Sections -->
          <div class="course-sections" v-if="courses.length">
            <ul>
              <li v-for="section in courses[0].sections" :key="section.id">
                {{ section.name }}
              </li>
            </ul>
          </div>
        </div>

        <div class="course-cards">
          <!-- Looping through courses -->
          <div 
            class="course-card" 
            v-for="course in courses" 
            :key="course.course_id" 
            @click="navigateToAssignments(course.course_id)" 
            :class="{ 'has-assignments': course.assignments.length > 0 }"
          >
            <div class="course-info">
              <i class="pi pi-file-edit course-logo"></i>
              <h4 class="course-name">{{ course.course_name }}</h4>
            </div>

            <!-- Display first assignment -->
            <div class="assignments-list" v-if="course.assignments.length > 0">
              <ul>
                <li 
                  @click.stop="navigateToAssignmentDetail(course.course_id, course.assignments[0].assignment_id)"
                >
                </li>
              </ul>
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

export default {
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      student: null,
      courses: [],
      searchQuery: '',
      isSidebarCollapsed: false,
    };
  },
  computed: {
    totalAssignments() {
      return this.courses.reduce((total, course) => total + course.assignments.length, 0);
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    async fetchCourses() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'student') {
          this.student = storedUser;
          const response = await axios.get(`http://127.0.0.1:8000/api/student_courses/${this.student.user_id}`);
          const courses = response.data.courses;

          // Fetch assignments for each course
          for (const course of courses) {
            const assignmentsResponse = await axios.get(`http://127.0.0.1:8000/api/student_assignments/${this.student.user_id}/${course.course_id}`);
            course.assignments = assignmentsResponse.data.assignments;
          }

          this.courses = courses;
        } else {
          console.error("User is not authenticated or not a student");
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    },

    navigateToAssignments(courseId) {
      this.$router.push({
        name: 'AssignmentContent', 
        params: { courseId: courseId.toString() }
      });
    },

    navigateToAssignmentDetail(courseId, assignmentId) {
      this.$router.push({
        name: 'AssignmentDetail', 
        params: { courseId: courseId.toString(), assignmentId: assignmentId.toString() }
      });
    }
  },
  mounted() {
    this.fetchCourses();
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
  background-color: #fff;
}

.course-header {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 2rem; /* Space between header and the course cards */
}

.course-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #2c3e50;
}

.course-sections ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.course-sections li {
  font-size: 1rem;
  color: #555;
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 items per row */
  gap: 4rem; /* Adds space between cards */
}

.course-card {
  background-color: #D9D9D9ff;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  padding: 20px;
  height: auto; /* Auto height to adjust based on content */
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.course-card.has-assignments {
  background-color: #007BF6;
  color: #ffffff;
}

.course-info {
  display: flex;
  align-items: center; /* Aligns the logo and text horizontally */
  gap: 10px; /* Adds space between the icon and course name */
}

.course-logo {
  font-size: 20px; /* Adjust the icon size */
  color: inherit; /* Set the icon color */
}
.course-card:not(.has-assignments) .course-name {
  color: black;
}

.course-card:not(.has-assignments) .course-logo {
  color: black; /* Black logo when no assignments */
}
.course-name {
  font-size: 20px;
  font-weight: 650;
}

.assignments-list {
  margin-top: 1rem;
}

.assignments-list ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.assignment-name {
  font-size: 1rem;
  font-weight: bold;
}

.assignment-due-date {
  font-size: 0.9rem;
  color: #888;
}

</style>
