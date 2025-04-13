<template>
  <div class="exams-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="exams-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" />

      <main class="exams-main">
        <div class="exams-header">
          <h2>Exams</h2>
        </div>

        <div class="exams-hero">
          <div class="content-left">
            <section class="exams-cards">
              <router-link
                class="exams-card"
                :to="`/course/${courseId}/exams`"
              >
                <h3>Exams</h3>
                <p>{{ pendingExams.length }} Pending</p>
              </router-link>

              <div class="exams-card completed">
                <h3>Completed Exams</h3>
                <p>{{ completedExams.length }} Completed</p>
              </div>
            </section>
          </div>

          <div class="content-right">
            <h3>Exams:</h3>
            <div v-if="exams.length" class="exam-cards">
              <div
                v-for="exam in exams"
                :key="exam.exam_id"
                class="exam-card"
                @click="navigateToExamDetails(exam.exam_id)"
              >
                <div class="card-header">
                  <h4>Teacher posted an exam:</h4>
                  {{ exam.title }}
                </div>
              </div>
            </div>
            <p v-else>No exams available.</p>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Header from '@/components/header.vue';
import Sidebar from "../Sidebar.vue";

export default {
  components: {
    Header,
    Sidebar,
  },
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      isSidebarCollapsed: false,
      exams: [],
      courses: [],
    };
  },
  computed: {
    courseId() {
      return parseInt(this.$route.params.courseId);
    },
    pendingExams() {
      return this.exams.filter((exam) => !exam.completed);
    },
    completedExams() {
      return this.exams.filter((exam) => exam.completed);
    }
  },
  methods: {
    async fetchExams() {
      try {
        const token = this.student?.access_token;
        if (!token) {
          console.error("No authentication token found");
          this.$router.push("/");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_exams/${this.student.user_id}/${this.courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data) {
          this.exams = response.data.exams.map((exam) => ({
            ...exam,
            completed: false,
          }));
          
          if (this.exams.length > 0) {
            for (let i = 0; i < this.exams.length; i++) {
              try {
                const submissionResponse = await axios.get(
                  `http://127.0.0.1:8000/api/exam-submission/${this.exams[i].exam_id}/${this.student.user_id}`
                );
                
                if (submissionResponse.data && submissionResponse.data.submission_id) {
                  this.exams[i].completed = true;
                }
              } catch (error) {
                if (error.response && error.response.status === 404) {
                } else {
                  console.error(`Error fetching submission for exam ${this.exams[i].exam_id}:`, error);
                }
              }
            }
          }
          
          this.courses = [{
            id: this.courseId,
            name: response.data.course_name || "Course Name Not Available",
            exams: this.exams
          }];
        }
      } catch (error) {
        console.error("Error fetching exams:", error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.$router.push("/");
        }
      }
    },

    navigateToExamDetails(examId) {
      this.$router.push(`/student/course/${this.courseId}/exam/${examId}`);
    },

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    getFileUrl(filePath) {
      if (!filePath) return null;

      if (filePath.startsWith("http")) {
        return filePath;
      }

      // Extract the filename from the path
      const fileName = filePath.split('/').pop();
      return `http://127.0.0.1:8000/api/exams/download/${encodeURIComponent(fileName)}`;
    },
    
    isExternalLink(filePath) {
      return filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'));
    }
  },

  async created() {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (!storedUser) {
      this.$router.push('/');
      return;
    }
    
    if (storedUser.role === "student") {
      this.student = storedUser;
      await this.fetchExams();
    } else {
      this.$router.push('/');
    }
  },
  // Refresh data when component is activated
  async activated() {
    if (this.student && this.student.role === "student") {
      await this.fetchExams();
    }
  }
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
  background-color: #fff;
}

.exams-header {
  padding: 20px;
  border-radius: 10px;
  background-color: #d9d9d9;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.274);
}

.exams-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.exams-hero {
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  flex-direction: row;
  padding: 1rem;
  gap: 10px;
  display: flex;
  align-items: center;
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

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}
</style>