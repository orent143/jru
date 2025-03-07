<template>
  <div class="course-content-container">
      <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="course-content">
          <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
          <main class="course-main" v-if="course">
              <div class="course-header">
                  <h2>{{ course.name }} - Assignments</h2>
                  <button class="add-btn" @click="showAddAssignmentModal = true">+</button>
                  <div class="course-sections">
                      <ul>
                          <li v-for="section in course.sections" :key="section.id">
                              {{ section.name }}
                          </li>
                      </ul>
                  </div>
              </div>
  
              <div class="course-hero">
                  <div class="content-left">
                      <section class="assignments-summary">
                          <h3>Due Soon:</h3>
                          <div class="assignment-list">
                              <ul>
                                  <li v-for="assignment in upcomingAssignments" :key="assignment.assignment_id">
                                      {{ assignment.title }} - Due: {{ formatDate(assignment.due_date) }}
                                  </li>
                              </ul>
                          </div>
                      </section>
                  </div>
  
                  <div class="content-right">
                      <section class="assignments">
                          <h3>All Assignments</h3>
                          <div class="material-cards">
                              <div v-for="assignment in assignments" 
                                   :key="assignment.assignment_id" 
                                   class="material-card" 
                                   @click="navigateToAssignment(assignment)">
                                  <div class="card-header">
                                      <i class="pi pi-file-edit"></i>
                                      <h4>Teacher posted a new assignment:</h4>
                                      {{ assignment.title }}
                                  </div>
                              </div>
                          </div>
                      </section>
                  </div>
              </div>
          </main>
      </div>
  
      <AddAssignmentModal 
          v-if="showAddAssignmentModal" 
          @close="showAddAssignmentModal = false" 
          @add-assignment="addAssignment"
          :courseId="courseId" 
      />
  </div>
</template>

<script>
import axios from 'axios';
import Header from "@/components/faculty/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import AddAssignmentModal from "@/components/faculty/Assignment/AddAssignmentModal.vue";

export default {
  name: 'FacultyAssignmentContent',
  components: {
      Header,
      Sidebar,
      AddAssignmentModal
  },
  data() {
      return {
          course: null,
          assignments: [],
          // Provide courses as an empty array to satisfy the Sidebar component
          courses: [],
          showAddAssignmentModal: false,
          teacher: {},
          searchQuery: '',
          isSidebarCollapsed: false
      };
  },
  props: {
      courseId: {
          type: Number,
          required: true
      }
  },
  computed: {
      upcomingAssignments() {
          return this.assignments.filter(assignment => 
              assignment.due_date && new Date(assignment.due_date) > new Date()
          );
      }
  },
  methods: {
      async fetchAssignments() {
          try {
              const response = await axios.get(`http://127.0.0.1:8000/api/assignments/${this.courseId}`);
              this.course = { 
                  name: response.data.course_name, 
                  assignments: response.data.assignments, 
                  sections: response.data.sections || [] 
              };
              this.assignments = response.data.assignments;
          } catch (error) {
              console.error("Error fetching assignments:", error);
          }
      },
      navigateToAssignment(assignment) {
          // Navigate using assignment.assignment_id
          this.$router.push({ 
              name: 'FacultyAssignmentDetails', 
              params: { assignmentId: assignment.assignment_id } 
          });
      },
      addAssignment(newAssignment) {
          this.assignments.push(newAssignment);
      },
      formatDate(dateString) {
          return new Date(dateString).toLocaleDateString();
      }
  },
  mounted() {
      this.fetchAssignments();
  }
};
</script>


<style scoped>
.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.course-content {
  display: flex;
  flex: 1;
}

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Course Header */
.course-header {
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
  position: relative;
}
/* Add Material Button */
.add-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background-color: #2c3e50;
  color: white;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background-color: #1a252f;
}

.course-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.course-sections ul {
  list-style: none;
  padding-left: 0;
}

.course-sections li {
  font-size: 1.1rem;
  color: #181818;
  margin-bottom: 0.5rem;
}

/* Main Content Layout */
.course-hero {
  display: flex;
  flex: 1;
  overflow: auto; /* Allow scrolling in the course-hero section */
  max-height: 60vh; /* Adjust as needed */
}

/* Left Panel */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 25%;
  overflow: auto;
}

/* Right Panel */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto;
}

/* Course Materials */
.course-materials {
  display: flex;
  flex-direction: column;
}

.material-cards {
  display: grid;
  gap: 1.5rem;
}

.material-card {
  background-color: #D9D9D9;
  border-radius: 8px;
  height: 80px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  padding: 1rem;
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem;
  color: #2c3e50;
}

/* Announcements & Assignments */
.assignments-summary {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}

.card-header h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.assignments-summary h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.assignments-summary ul {
  list-style: none;
  padding-left: 0;
  
}
.assignments-summary li {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 0.5rem;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #333;
}

.form-group input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input::placeholder {
  color: #aaa;
}

/* Section Titles */
.course-materials h3,
.quizzes h3 {
  font-size: 1.5rem;
  color: #2c3e50;
}
.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-btn {
  background-color: #2c3e50;
  color: rgb(255, 255, 255);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
}

.view-btn:hover {
  background-color: #1a252f;
}
/* Responsive Design */
@media (max-width: 768px) {
  .course-content {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    padding-left: 0;
    padding-right: 0;
    flex: none;
  }

  .content-right {
    padding-left: 0;
  }
}
</style>