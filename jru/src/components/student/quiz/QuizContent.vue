<template>
  <div class="quizzes-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="quizzes-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <main class="quizzes-main" v-if="course">
        <div class="quizzes-header">
          <h2>{{ course.course_name }} - Quizzes</h2>
          <p class="quizzes-subtitle">
            View your upcoming and completed quizzes, and stay prepared for important assessments.
          </p>
        </div>

        <div class="quizzes-hero">
          <div class="content-left">
            <section class="quizzes-summary">
              <h3>Quiz Overview</h3>
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
  overflow: hidden;
}

.quizzes-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.quizzes-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  
}

.quizzes-header {
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

.quizzes-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background-color: #6C5CE7;
}

.quizzes-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}
.quizzes-subtitle {
  color: #6c757d;
  font-size: 1rem;
  max-width: 600px;
}
.quizzes-hero {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 30%;
}

.quizzes-summary {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 70%;
}

.quizzes-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

h3 {
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



.quizzes-card {
  padding: 1.2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
  padding-left: 1.5rem;
}

.quizzes-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 4px;
  background-color: #6C5CE7;
  opacity: 0.5;
}

.quizzes-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  border: none;
  padding: 0;
}

.quizzes-card p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

.quizzes-card.completed {
  border-left: 4px solid #28a745;
}

.quizzes-card.completed::before {
  background-color: #28a745;
}

.quizzes-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.quiz-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.quiz-card {
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
  border-left: 4px solid #6C5CE7;
  position: relative;
}

.quiz-card::before {
  content: "\e90f"; /* PrimeIcons question icon */
  font-family: 'primeicons';
  position: absolute;
  top: 1rem;
  left: -2px;
  color: #6C5CE7;
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

.quiz-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

@media (max-width: 1024px) {
  .quizzes-hero {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    width: 100%;
  }
}
</style>