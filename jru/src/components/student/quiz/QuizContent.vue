<template>
  <div class="quizzes-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="quizzes-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="quizzes-main" v-if="course">
        <div class="quizzes-header">
          <h2>{{ course.course_name }} - Quizzes</h2>
        </div>

        <div class="quizzes-hero">
          <!-- Left Side: Quiz Cards -->
          <div class="content-left">
            <section class="quizzes-cards">
              <!-- Quizzes Card -->
              <router-link
                class="quizzes-card"
                :to="`/quizzes/${course.course_id}`"
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
    <div
      v-for="quiz in quizzes"
      :key="quiz.quiz_id"
      class="quiz-card"
      @click="navigateToQuizDetails(course.course_id, quiz.quiz_id)"
    >
      <h4>{{ quiz.title }}</h4>
      <p>{{ quiz.description }}</p>
      <p class="due-date">Quiz Date: {{ quiz.quiz_date || "No Date" }}</p>
    </div>
  </div>
</div>

        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/student/Header.vue";
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
      quizzes: [],
      courses: [],
      course: { course_id: null, course_name: "Loading..." }, // Default placeholder before API fetch
      studentId: null
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "student") {
      this.studentId = storedUser.user_id;
      await this.fetchQuizzes();
    }
  },
  watch: {
    courseId: {
      handler() {
        if (this.courseId) {
          this.fetchQuizzes();
        }
      },
      immediate: true
    }
  },
  computed: {
    pendingQuizzes() {
      console.log("Pending Quizzes Computed:", this.quizzes);
      return this.quizzes.filter((q) => q.completed === false || q.completed === null);
    },
    completedQuizzes() {
      return this.quizzes.filter((q) => q.completed === true);
    }
  },
  methods: {
    async fetchQuizzes() {
    if (!this.courseId) {
      console.warn("fetchQuizzes skipped: Missing courseId");
      return;
    }

    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/quizzes/${this.courseId}`);
      console.log("Fetched Quiz Data:", response.data);

      if (response.data) {
        this.course = {
          course_id: this.courseId,
          course_name: response.data.course_name || "Not Available",
        };
        this.quizzes = response.data.quizzes || [];
      }
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      alert("Failed to load quizzes. Please try again.");
    }
  },
    navigateToQuizDetails(courseId, quizId) {
      this.$router.push({
        name: "QuizDetails",
        params: { courseId: courseId, quizId }
      });
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }
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
  background-color: #fff;

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