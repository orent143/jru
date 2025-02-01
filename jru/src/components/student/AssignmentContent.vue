<template>
  <div class="assignments-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="assignments-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="assignments-main" v-if="course">
        <div class="assignments-header">
          <h2>{{ course.name }} - Assignments</h2>
        </div>

        <div class="assignments-hero">
          <!-- Left Side: Assignment Cards -->
          <div class="content-left">
            <section class="assignments-cards">
              <!-- Assignments Card -->
              <router-link
                class="assignments-card"
                :to="`/assignments/${course.id}`"
                tag="div"
              >
                <h3>Assignments</h3>
                <p>{{ pendingAssignments.length }} Pending</p>
              </router-link>

              <!-- Completed Assignments Card -->
              <div class="assignments-card completed">
                <h3>Completed Assignments</h3>
                <p>{{ completedAssignments.length }} Completed</p>
              </div>
            </section>
          </div>

          <!-- Right Side: Assignments List -->
          <div class="content-right">
              <h3>Assignments:</h3>
              <div class="assignment-cards">
                <!-- Loop through each assignment and create individual cards -->
                <div
                  v-for="assignment in pendingAssignments"
                  :key="assignment.id"
                  class="assignment-card"
                  @click="navigateToAssignmentDetails(course.id, assignment.id)"
                >
                  <h4>Teacher posted a new assignment: </h4>
                  <p>{{ assignment.name }}</p>
                </div>
              </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Header from "./Header.vue";
import Sidebar from "./Sidebar.vue";

export default {
  components: {
    Header,
    Sidebar,
  },
  data() {
    return {
      student: { name: "John Doe" },
      isSidebarCollapsed: false,
      completedAssignments: [],
      courses: [
        {
          id: 1,
          name: "ITELECT4",
          assignments: [
            { id: 1, name: "Assignment 1", dueDate: "2024-02-01", completed: false },
            { id: 2, name: "Assignment 2", dueDate: "2024-02-02", completed: false },
            { id: 3, name: "Assignment 3", dueDate: "2024-02-03", completed: false },
          ],
        },
        {
          id: 2,
          name: "GEC010",
          assignments: [
            { id: 1, name: "Case Study Analysis", dueDate: "2024-02-10", completed: true },
          ],
        },
        {
          id: 3,
          name: "CC321",
          assignments: [
            { id: 1, name: "Pattern Implementation", dueDate: "2024-02-15", completed: false },
          ],
        },
      ],
    };
  },
  computed: {
    course() {
      const courseId = parseInt(this.$route.params.courseId);
      return this.courses.find((c) => c.id === courseId) || null;
    },
    pendingAssignments() {
      return this.course ? this.course.assignments.filter((a) => !a.completed) : [];
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    navigateToAssignments(courseId) {
      this.$router.push(`/assignments/${courseId}`);
    },
    navigateToAssignmentDetails(courseId, assignmentId) {
      this.$router.push(`/course/${courseId}/assignment/${assignmentId}`);
    },
  },
};
</script>

<style scoped>
.assignments-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.assignments-content {
  display: flex;
  flex: 1;
}

.assignments-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.assignments-header {
  padding: 20px;
  border-radius: 10px;
  background-color: #d9d9d9;
}

.assignments-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

/* Assignments Hero Layout */
.assignments-hero {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

/* Left Side: Cards */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 20%;
  overflow: auto; /* Allow scrolling */
}

.assignments-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignments-card {
  padding: 1.5rem;
  border-radius: 8px;
  background: #D9D9D9;
  cursor: pointer;
  color: black;
  font-weight: bold;
}
.assignments-card h3 {
  font-size: 17px;
    font-weight: 600;
    color: #000000d2;
}
.assignments-card:hover {
  background: #D9D9D9;
}
.assignments-card p {
  font-size: 1.1rem;
    color: #444;
}
.completed {
  background: #D9D9D9;
}

/* Right Side: Assignment Cards */
.content-right {
  flex: 2;
}

 h3 {
  font-size: 1.5rem;
  color: #2c3e50;
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
  flex-direction: row; /* Make the layout horizontal */
  padding: 1rem;
  gap: 10px;

  display: flex;
  align-items: center; /* Vertically center the content */
}

.assignment-card:hover {
  transform: translateY(-5px);
}

.assignment-card h4 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.assignment-card p {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  color: #333;
}
</style>
