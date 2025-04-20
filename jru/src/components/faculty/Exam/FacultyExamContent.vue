<template>
  <div class="course-content-container">
    <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <div class="page-header">
          <div class="header-content">
            <h1>{{ course.name }} - Examinations</h1>
            <p class="course-subtitle">Create and manage exams to assess student understanding and performance.</p>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="showAddExamModal = true">
              <i class="pi pi-plus"></i>
              Create Exam
            </button>
          </div>
        </div>

        <div class="content-grid">
          <div class="content-column-left">
            <section class="exam-summary">
              <div class="section-header">
                <h2>
                  <i class="pi pi-calendar section-icon"></i>
                  Upcoming Exams
                </h2>
                <span class="last-updated">Last updated: {{ formattedDate }}</span>
              </div>
              <div v-if="upcomingExams.length === 0" class="empty-state">
                <i class="pi pi-info-circle"></i>
                <p>No upcoming exams available</p>
              </div>
              <ul v-else class="exam-list">
                <li v-for="exam in upcomingExams" :key="exam.exam_id" class="exam-item">
                  <h3>{{ exam.title }}</h3>
                  <p>Date: {{ formatDate(exam.exam_date) }}</p>
                </li>
              </ul>
            </section>
          </div>

          <div class="content-column-right">
            <section class="exams">
              <div class="section-header">
                <h2>
                  <i class="pi pi-file section-icon"></i>
                  All Examinations
                </h2>
              </div>
              <div v-if="course.exams.length === 0" class="empty-state">
                <i class="pi pi-folder"></i>
                <p>No exams available</p>
              </div>
              <div v-else class="material-cards">
                <div v-for="exam in course.exams" :key="exam.exam_id" class="material-card" @click="navigateToExam(exam)">
                  <div class="material-icon">
                    <i class="pi pi-file"></i>
                  </div>
                  <div class="material-info">
                    <h3>{{ exam.title }}</h3>
                    <div class="material-meta">
                      <span class="material-type">Exam</span>
                      <span class="material-date">{{ formatDate(exam.exam_date) }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <i class="pi pi-trash delete-icon" @click.stop="confirmDeleteExam(exam.exam_id)"></i>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <AddExamModal v-if="showAddExamModal"
                  :courseId="this.$route.params.courseId"
                  @close="showAddExamModal = false"
                  @add-exam="fetchExams" />

                  
    <ConfirmationModal
    :show="showDeleteConfirmation"
    title="Delete Exam"
    :message="'Are you sure you want to delete this exam?'"
    confirmText="Delete"
    type="danger"
    @confirm="handleDeleteExam"
    @cancel="cancelDeleteExam"
    />
  </div>
</template>

<script>
import Header from '../../header.vue';
import Sidebar from '../SideBar.vue';
import AddExamModal from '@/components/faculty/Exam/AddExamModal.vue';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import axios from 'axios';

export default {
  components: { Header, Sidebar, AddExamModal, ConfirmationModal },
  data() {
    return {
      teacher: {},
      searchQuery: '',
      isSidebarCollapsed: false,
      course: null,
      showAddExamModal: false,
      upcomingExams: [],
      showDeleteConfirmation: false,
      pendingDeleteExamId: null
    };
  },
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  async created() {
    await this.fetchExams();
  },
  methods: {
    async fetchExams() {
      try {
        const courseId = this.$route.params.courseId; 
        const response = await axios.get(`http://127.0.0.1:8000/api/exams/exams/${courseId}`);

        this.course = {
          name: response.data.course_name,
          exams: response.data.exams,
        };

        this.upcomingExams = this.course.exams.filter(exam => {
          return new Date(exam.exam_date) >= new Date();
        });
      } catch (error) {
        console.error('Error fetching exams:', error);
      }
    },
    navigateToExam(exam) {
      this.$router.push({ 
        name: 'FacultyExamDetails', 
        params: { examId: exam.exam_id } 
      });
    },
    confirmDeleteExam(examId) {
      this.pendingDeleteExamId = examId;
      this.showDeleteConfirmation = true;
    },
    async handleDeleteExam() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/exams/${this.pendingDeleteExamId}`);
        this.course.exams = this.course.exams.filter(
          exam => exam.exam_id !== this.pendingDeleteExamId
        );
      } catch (error) {
        console.error("Error deleting exam:", error);
      } finally {
        this.showDeleteConfirmation = false;
        this.pendingDeleteExamId = null;
      }
    },
    cancelDeleteExam() {
      this.showDeleteConfirmation = false;
      this.pendingDeleteExamId = null;
    },
    formatDate(dateString) {
      if (!dateString) return "Date not available";
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  },
};
</script>

<style scoped>
.course-content-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.course-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.course-main {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
    background-color: #f8f9fa;
    overflow-y: auto;
    max-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.header-content h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.course-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #007BF6;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #0069d9;
}

.content-grid {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.content-column-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 30%;
}

.content-column-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 70%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  color: #007BF6;
}

.last-updated {
  font-size: 0.85rem;
  color: #6c757d;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  color: #adb5bd;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Exam Summary */
.exam-summary {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
}

.exam-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exam-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007BF6;
}

.exam-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.exam-item p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

/* Exams Section */
.exams {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.material-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-card {
  display: flex;
    padding: 1rem;
    background-color: #f8f9fa;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s;
    cursor: pointer;
    position: relative;
    border-left: 4px solid #007BF6;
}


.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.material-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f2ff;
  color: #007BF6;
  border-radius: 8px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.material-icon i {
  font-size: 1.2rem;
}

.material-info {
  flex: 1;
  overflow: hidden;
}

.material-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.material-type,
.material-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.material-type {
  background-color: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.card-actions {
  display: flex;
  align-items: center;
}

.delete-icon {
  font-size: 1rem;
  color: #dc3545;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.delete-icon:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

@media (max-width: 1200px) {
  .content-grid {
    flex-direction: column;
  }
  
  .content-column-left,
  .content-column-right {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
}
</style>
