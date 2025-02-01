<template>
    <div class="exams-container">
      <Header :student="student" @toggleSidebar="toggleSidebar" />
      <div class="exams-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <main class="exams-main" v-if="course">
          <div class="exams-header">
            <h2>{{ course.name }} - Exams</h2>
          </div>
  
          <div class="exams-hero">
            <!-- Left Side: Exam Cards -->
            <div class="content-left">
              <section class="exams-cards">
                <!-- Exams Card -->
                <router-link
                  class="exams-card"
                  :to="`/exams/${course.id}`"
                  tag="div"
                >
                  <h3>Exams</h3>
                  <p>{{ pendingExams.length }} Pending</p>
                </router-link>
  
                <!-- Completed Exams Card -->
                <div class="exams-card completed">
                  <h3>Completed Exams</h3>
                  <p>{{ completedExams.length }} Completed</p>
                </div>
              </section>
            </div>
  
            <!-- Right Side: Exams List -->
            <div class="content-right">
              <h3>Exams:</h3>
              <div class="exam-cards">
                <!-- Loop through each exam and create individual cards -->
                <div
                  v-for="exam in pendingExams"
                  :key="exam.id"
                  class="exam-card"
                  @click="navigateToExamDetails(course.id, exam.id)"
                >
                  <h4>Teacher posted a new exam:</h4>
                  <p>{{ exam.name }}</p>
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
        completedExams: [],
        courses: [
          {
            id: 1,
            name: "ITELECT4",
            exams: [
              { id: 1, name: "Exam 1", dueDate: "2024-02-01", completed: false },
              { id: 2, name: "Exam 2", dueDate: "2024-02-02", completed: false },
              { id: 3, name: "Exam 3", dueDate: "2024-02-03", completed: false },
            ],
          },
          {
            id: 2,
            name: "GEC010",
            exams: [
              { id: 1, name: "Case Study Analysis", dueDate: "2024-02-10", completed: false },
            ],
          },
          {
            id: 3,
            name: "CC321",
            exams: [
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
      pendingExams() {
        return this.course ? this.course.exams.filter((e) => !e.completed) : [];
      },
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
      navigateToExams(courseId) {
        this.$router.push(`/exams/${courseId}`);
      },
      navigateToExamDetails(courseId, examId) {
        this.$router.push(`/course/${courseId}/exam/${examId}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .exams-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .exams-content {
    display: flex;
    flex: 1;
  }
  
  .exams-main {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .exams-header {
    padding: 20px;
    border-radius: 10px;
    background-color: #d9d9d9;
  }
  
  .exams-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #000;
  }
  
  /* Exams Hero Layout */
  .exams-hero {
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
  
  .exams-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .exams-card {
    padding: 1.5rem;
    border-radius: 8px;
    background: #d9d9d9;
    cursor: pointer;
    color: black;
    font-weight: bold;
  }
  .exams-card h3 {
    font-size: 17px;
    font-weight: 600;
    color: #000000d2;
  }
  .exams-card:hover {
    background: #d9d9d9;
  }
  .exams-card p {
    font-size: 1.1rem;
    color: #444;
  }
  .completed {
    background: #d9d9d9;
  }
  
  /* Right Side: Exam Cards */
  .content-right {
    flex: 2;
  }
  
  h3 {
    font-size: 1.5rem;
    color: #2c3e50;
  }
  
  .exam-cards {
    display: grid;
    gap: 1.5rem;
  }
  
  .exam-card {
    background-color: #d9d9d9;
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
  
  .exam-card:hover {
    transform: translateY(-5px);
  }
  
  .exam-card h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    font-weight: 500;
    color: #333;
  }
  
  .exam-card p {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    color: #333;
  }
  </style>