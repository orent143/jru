<template>
  <div class="assignment-content-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="assignment-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="assignment-main" v-if="course">
        <div class="assignment-header">
          <h2>{{ course.course_name }} - Assignments</h2>
          <p class="assignment-subtitle">
            View your upcoming and completed assignments, and stay prepared for important assessments.
          </p>
        </div>

        <div class="assignment-hero">
          <div class="content-left">
            <section class="assignments-summary">
              <h3>Assignment Overview</h3>
              <div class="assignment-summary-cards">
                <div class="assignment-summary-card pending">
                  <h4>Pending Assignments</h4>
                  <p>{{ pendingAssignments.length }} Pending</p>
                </div>
                <div class="assignment-summary-card completed">
                  <h4>Completed Assignments</h4>
                  <p>{{ completedAssignments.length }} Completed</p>
                </div>
              </div>
            </section>
          </div>

          <div class="content-right">
            <section class="assignments-list">
              <h3>Assignments</h3>
              <div class="assignment-cards">
                <div 
                  v-for="assignment in assignments" 
                  :key="assignment.assignment_id"
                  class="assignment-card"
                  @click="navigateToAssignmentDetails(assignment.assignment_id)"
                >
                  <div class="card-header">
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
  </div>
</template>

<script>
import axios from "axios";
import Header from '@/components/header.vue';
import Sidebar from "@/components/student/Sidebar.vue";

export default {
  components: {
    Header,
    Sidebar,
  },
  props: ["courseId"],
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      isSidebarCollapsed: false,
      assignments: [],
      courses: [],
      course: { course_name: "Loading..." },
      studentId: null
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "student") {
      this.studentId = storedUser.user_id;
      await this.fetchAssignments();
    }
  },
  watch: {
    courseId: {
      handler() {
        this.fetchAssignments();
      },
      immediate: true
    }
  },
  computed: {
    pendingAssignments() {
      return this.assignments.filter((a) => a.completed === false || a.completed === null);
    },
    completedAssignments() {
      return this.assignments.filter((a) => a.completed === true);
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    
    async fetchAssignments() {
      if (!this.studentId || !this.courseId) return;
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_assignments/${this.studentId}/${this.courseId}`
        );

        console.log("Fetched Assignments:", response.data);

        const assignmentsData = response.data.assignments || [];
        this.assignments = assignmentsData.map(assignment => ({
          ...assignment,
          completed: false
        }));
        
        for (let i = 0; i < this.assignments.length; i++) {
          try {
            const submissionResponse = await axios.get(
              `http://127.0.0.1:8000/api/assignment-submission/${this.assignments[i].assignment_id}/${this.studentId}`
            );
            
            if (submissionResponse.data && submissionResponse.data.submission_id) {
              this.assignments[i].completed = true;
            }
          } catch (error) {
            if (error.response && error.response.status === 404) {
            } else {
              console.error(`Error checking submission for assignment ${this.assignments[i].assignment_id}:`, error);
            }
          }
        }
        
        this.course = { course_name: response.data.course_name || "Course Name Not Available" };
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    },
    navigateToAssignmentDetails(assignmentId) {
      this.$router.push({
        name: "AssignmentDetails",
        params: { courseId: this.courseId, assignmentId }
      });
    },
    formatDate(dateString) {
      if (!dateString) return "No due date";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });
    }
  }
};
</script>

<style scoped>
.assignment-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.assignment-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.assignment-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.assignment-header {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.assignment-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background-color: #007BF6;
}

.assignment-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}
.assignment-subtitle {
  color: #6c757d;
  font-size: 1rem;
  max-width: 600px;
}


.assignment-hero {
  display: flex;
  flex-direction: row;
  gap: 2rem;
  overflow: auto;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 30%;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 70%;
  overflow: auto;
}

.assignments-summary {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.assignments-summary h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}


.assignment-summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-summary-card {
  padding: 1.2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
  padding-left: 1.5rem;
}

.assignment-summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.assignment-summary-card.pending {
  border-left: 4px solid #fd7e14;
}

.assignment-summary-card.completed {
  border-left: 4px solid #28a745;
}

.assignment-summary-card h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.assignment-summary-card p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

.assignments-list {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.assignments-list h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}


.assignment-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-card {
  display: flex;
  align-items: center;
  padding: 1rem 1rem 1rem 1.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  height: auto;
  min-height: 60px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-left: 4px solid #007BF6;
  position: relative;
}

.assignment-card::before {
  content: "\e933"; /* PrimeIcons file-edit icon */
  font-family: 'primeicons';
  position: absolute;
  top: 1rem;
  left: -2px;
  color: #007BF6;
  font-size: 0.9rem;
  transform: translateX(-50%);
  background-color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.assignment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 1rem;
  color: #495057;
  width: 100%;
}

.card-header h4 {
  font-size: 0.8rem;
  font-weight: 500;
  color: #6c757d;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

@media (max-width: 768px) {
  .assignment-hero {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    width: 100%;
  }
}
</style>