<template>
    <div class="quizzes-container">
      <Header :student="student" @toggleSidebar="toggleSidebar" />
      <div class="quizzes-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <main class="quizzes-main" v-if="course">
          <div class="quizzes-header">
            <h2>{{ course.name }} - Quizzes</h2>
          </div>
  
          <div class="quizzes-hero">
            <!-- Left Side: Quiz Cards -->
            <div class="content-left">
              <section class="quizzes-cards">
                <!-- Quizzes Card -->
                <router-link
                  class="quizzes-card"
                  :to="`/quizzes/${course.id}`"
                  tag="div"
                >
                  <h3>Quizzes</h3>
                  <p>{{ pendingQuizzes.length }} Pending</p>
                </router-link>
  
                <!-- Completed Quizzes Card -->
                <div class="quizzes-card completed">
                  <h3>Completed Quizzes</h3>
                  <p>{{ completedQuizzes.length }} Completed</p>
                </div>
              </section>
            </div>
  
            <!-- Right Side: Quizzes List -->
            <div class="content-right">
              <h3>Quizzes:</h3>
              <div class="quiz-cards">
                <!-- Loop through each quiz and create individual cards -->
                <div
                  v-for="quiz in pendingQuizzes"
                  :key="quiz.id"
                  class="quiz-card"
                  @click="navigateToQuizDetails(course.id, quiz.id)"
                >
                  <h4>Teacher posted a new quiz:</h4>
                  <p>{{ quiz.name }}</p>
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
        completedQuizzes: [],
        courses: [
          {
            id: 1,
            name: "ITELECT4",
            quizzes: [
              { id: 1, name: "Quiz 1", dueDate: "2024-02-01", completed: false },
              { id: 2, name: "Quiz 2", dueDate: "2024-02-02", completed: false },
              { id: 3, name: "Quiz 3", dueDate: "2024-02-03", completed: false },
            ],
          },
          {
            id: 2,
            name: "GEC010",
            quizzes: [
              { id: 1, name: "Case Study Analysis", dueDate: "2024-02-10", completed: false },
            ],
          },
          {
            id: 3,
            name: "CC321",
            quizzes: [
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
      pendingQuizzes() {
        return this.course ? this.course.quizzes.filter((e) => !e.completed) : [];
      },
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
      navigateToQuizzes(courseId) {
        this.$router.push(`/quizzes/${courseId}`);
      },
      navigateToQuizDetails(courseId, quizId) {
        this.$router.push(`/course/${courseId}/quiz/${quizId}`);
      },
    },
  };
  </script>
  
  <style scoped>
  .quizzes-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .quizzes-content {
    display: flex;
    flex: 1;
  }
  
  .quizzes-main {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .quizzes-header {
    padding: 20px;
    border-radius: 10px;
    background-color: #d9d9d9;
  }
  
  .quizzes-header h2 {
    font-size: 2rem;
    font-weight: 700;
    color: #000;
  }
  
  /* Quizzes Hero Layout */
  .quizzes-hero {
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
  
  .quizzes-cards {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  .quizzes-card {
    padding: 1.5rem;
    border-radius: 8px;
    background: #d9d9d9;
    cursor: pointer;
    color: black;
    font-weight: bold;
  }
  .quizzes-card h3 {
    font-size: 17px;
    font-weight: 600;
    color: #000000d2;
  }
  .quizzes-card:hover {
    background: #d9d9d9;
  }
  .quizzes-card p {
    font-size: 1.1rem;
    color: #444;
  }
  .completed {
    background: #d9d9d9;
  }
  
  /* Right Side: Quiz Cards */
  .content-right {
    flex: 2;
  }
  
  h3 {
    font-size: 1.5rem;
    color: #2c3e50;
  }
  
  .quiz-cards {
    display: grid;
    gap: 1.5rem;
  }
  
  .quiz-card {
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
  
  .quiz-card:hover {
    transform: translateY(-5px);
  }
  
  .quiz-card h4 {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    font-weight: 500;
    color: #333;
  }
  
  .quiz-card p {
    display: flex;
    align-items: center;
    font-size: 1.2rem;
    color: #333;
  }
  </style>