<template>
  <div class="exams-container">
    <Header :student="student" @toggleSidebar="toggleSidebar" />
    <div class="exams-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" />

      <main class="exams-main">
        <div class="exams-header">
          <h2>Exams</h2>
          <p class="exams-subtitle">
            View your upcoming and completed exams, and stay prepared for important assessments.
          </p>
        </div>

        <div class="exams-hero">
          <div class="content-left">
            <section class="exams-summary">
              <h3>Exam Overview</h3>
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
  overflow: hidden;
}

.exams-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.exams-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.exams-header {
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

.exams-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 6px;
  height: 100%;
  background-color: #FD7E14;
}

.exams-header h2 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.exams-subtitle {
  color: #6c757d;
  font-size: 1rem;
  max-width: 600px;
}
.exams-hero {
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

.exams-summary {
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

.exams-cards {
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



.exams-card {
  padding: 1.2rem;
  border-radius: 8px;
  background-color: #f8f9fa;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
  overflow: hidden;
  padding-left: 1.5rem;
}

.exams-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.exams-card h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  border: none;
  padding: 0;
}

.exams-card p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

.exams-card.completed {
  border-left: 4px solid #28a745;
}

.exam-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.exam-card {
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
  border-left: 4px solid #FD7E14;
  position: relative;
}

.exam-card::before {
  content: "\e90c"; /* PrimeIcons check-square icon */
  font-family: 'primeicons';
  position: absolute;
  top: 1rem;
  left: -2px;
  color: #FD7E14;
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

.exam-card:hover {
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

@media (max-width: 1024px) {
  .exams-hero {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    width: 100%;
  }
}
</style>