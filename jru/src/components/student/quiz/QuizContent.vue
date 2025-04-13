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
          <div class="content-left">
            <section class="quizzes-cards">
              <div class="quizzes-card">
                <h3>Quizzes</h3>
                <p>{{ pendingQuizzes.length }} Pending</p>
              </div>

              <div class="quizzes-card completed">
                <h3>Completed Quizzes</h3>
                <p>{{ completedQuizzes.length }} Completed</p>
              </div>
            </section>
          </div>

          <div class="content-right">
            <h3>Quizzes:</h3>
            <div class="quiz-cards">
              <div
                v-for="quiz in quizzes"
                :key="quiz.quiz_id"
                class="quiz-card"
                @click="navigateToQuizDetails(course.course_id, quiz.quiz_id)"
              >
                <div class="card-header">
                  <h4>Teacher posted a quiz:</h4>
                  {{ quiz.title }}
                </div>
                
              </div>
            </div>
            <p v-if="!quizzes.length">No quizzes available.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/header.vue";
import Sidebar from "@/components/student/Sidebar.vue";

export default {
  name: 'QuizContent',
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
      course: { course_name: "Loading..." },
      studentId: null,
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      this.$router.push('/');
      return;
    }
    
    if (storedUser.role === "student") {
      this.studentId = storedUser.user_id;
      await this.fetchQuizzes();
    } else {
      this.$router.push('/');
    }
  },
  watch: {
    courseId: {
      handler() {
        if (this.studentId) {
          this.fetchQuizzes();
        }
      },
      immediate: true,
    },
  },
  computed: {
    pendingQuizzes() {
      return this.quizzes.filter((quiz) => !quiz.completed);
    },
    completedQuizzes() {
      return this.quizzes.filter((quiz) => quiz.completed);
    },
  },
  methods: {
    async fetchQuizzes() {
      if (!this.studentId || !this.courseId) return;

      const token = this.student?.access_token;
      if (!token) {
        console.error("No authentication token found.");
        this.$router.push("/");
        return;
      }

      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_quizzes/${this.studentId}/${this.courseId}`,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        console.log("Fetched Quizzes:", response.data);
        
        if (response.data) {
          this.quizzes = (response.data.quizzes || []).map(quiz => ({
            ...quiz,
            completed: false
          }));
          
          if (this.quizzes.length > 0) {
            for (let i = 0; i < this.quizzes.length; i++) {
              try {
                const submissionResponse = await axios.get(
                  `http://127.0.0.1:8000/api/quiz-submission/${this.quizzes[i].quiz_id}/${this.studentId}`
                );
                
                if (submissionResponse.data && submissionResponse.data.submission_id) {
                  this.quizzes[i].completed = true;
                }
              } catch (error) {
                if (error.response && error.response.status === 404) {
                } else {
                  console.error(`Error fetching submission for quiz ${this.quizzes[i].quiz_id}:`, error);
                }
              }
            }
          }
          
          this.course = { 
            course_id: response.data.course_id,
            course_name: response.data.course_name || "Course Name Not Available" 
          };
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.$router.push("/");
        }
      }
    },
    navigateToQuizDetails(courseId, quizId) {
      this.$router.push({
        name: "QuizDetails",
        params: { courseId, quizId },
      });
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    isExternalLink(path) {
      return path && (path.startsWith('http://') || path.startsWith('https://'));
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
  background-color: #fff;
}

.quizzes-header {
  padding: 20px;
  border-radius: 10px;
  background-color: #d9d9d9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.274);
}

.quizzes-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.quizzes-hero {
  display: flex;
  justify-content: space-between;
  gap: 2rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 20%;
  overflow: auto;
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
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-weight: bold;
  transition: transform 0.3s ease;
}

.quizzes-card:hover {
  transform: translateY(-2px);
  background: #cecece;
}

.quizzes-card h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.quizzes-card p {
  font-size: 1.1rem;
  color: #444;
  margin-top: 0.5rem;
}

.completed {
  background: #d9d9d9;
}

.content-right {
  flex: 2;
}

h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
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
  padding: 1rem;
  display: flex;
  align-items: center;
}

.quiz-card:hover {
  transform: translateY(-5px);
  background-color: #cecece;
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

.card-icons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #f0f0f0;
  color: #555;
}

.icon-container.completed {
  background-color: #4caf50;
  color: white;
}

@media (max-width: 768px) {
  .quizzes-hero {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    width: 100%;
  }
}
</style>