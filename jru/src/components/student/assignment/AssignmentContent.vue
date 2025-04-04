<template>
  <div class="assignment-content-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="assignment-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="assignment-main" v-if="course">
        <div class="assignment-header">
          <h2>{{ course.course_name }} - Assignments</h2>
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
      course: { course_name: "Loading..." }, // Default placeholder before API fetch
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
    async fetchAssignments() {
  if (!this.studentId || !this.courseId) return;
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/student_assignments/${this.studentId}/${this.courseId}`
    );

    console.log("Fetched Assignments:", response.data);

    this.assignments = response.data.assignments || [];
    
    // ✅ Correctly assign course_name from the API response
    this.course = { course_name: response.data.course_name || "Course Name Not Available" };
  } catch (error) {
    console.error("Error fetching assignments:", error);
  }
}
,
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
}

.assignment-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #fff;

}

.assignment-header {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
}

.assignment-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000000;
}

.assignment-hero {
  display: flex;
  flex: 1;
  overflow: auto;
  max-height: 60vh;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 20%;
  overflow: auto;
}

.assignment-summary-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-summary-card {
  padding: 1.5rem;
  border-radius: 8px;
  background: #D9D9D9;
  cursor: pointer;
  color: black;
  font-weight: bold;
}

.assignment-summary-card h4 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.assignment-summary-card p {
  font-size: 1.1rem;
  color: #444;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto;
}

.assignments-list {
  flex-direction: column;
}

.assignment-cards {
  display: grid;
  gap: 1.5rem;
}

.assignment-card {
  background-color: #D9D9D9;
  border-radius: 8px;
  height: 80px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  flex-direction: row;
  padding: 1rem;
  display: flex;
  align-items: center;
}

.assignment-card:hover {
  transform: translateY(-5px);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}

.card-header h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

@media (max-width: 768px) {
  .assignment-content {
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