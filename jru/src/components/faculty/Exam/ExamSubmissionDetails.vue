<template>
  <div class="submission-details-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="submission-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" />
      <div class="submission-main">
        <div class="header-section">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i> Back to Submissions
          </button>
          <h1>Exam Submission Details</h1>
        </div>

        <div v-if="loading" class="loading-message">
          <p>Loading submission details...</p>
        </div>

        <div v-else-if="error" class="error-message">
          <p>{{ error }}</p>
        </div>

        <div v-else class="submission-details">
          <!-- Student Information -->
          <div class="student-info-section">
            <h2>Student Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Name:</span>
                <span class="value">{{ submission.student_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Student ID:</span>
                <span class="value">{{ submission.student_id }}</span>
              </div>
              <div class="info-item">
                <span class="label">Submitted:</span>
                <span class="value">{{ formatDate(submission.submitted_at) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Status:</span>
                <span class="value">
                  <span class="status-badge" :class="getStatusClass(submission.status)">
                    {{ submission.status || 'Unknown' }}
                  </span>
                </span>
              </div>
              <div class="info-item" v-if="submission.grade !== null">
                <span class="label">Score:</span>
                <span class="value">{{ submission.grade }}/{{ exam.total_points }}</span>
              </div>
            </div>
          </div>

          <div class="submission-content-wrapper">
            <!-- Submission Content -->
            <div class="submission-content-section">
              <h2>Submission Content</h2>
              <div class="content-box">
                <div v-if="submission.submission_text" class="text-content">
                  <h3>Text Submission</h3>
                  <p>{{ submission.submission_text }}</p>
                </div>

                <div v-if="submission.file_path" class="file-content">
                  <h3>File Submission</h3>
                  <div class="file-preview">
                    <div class="file-info">
                      <i class="pi pi-file"></i>
                      <span class="file-name">{{ getFileName(submission.file_path) }}</span>
                    </div>
                    <div class="file-actions">
                      <a v-if="isExternalLink(submission.file_path)" 
                         :href="submission.file_path" 
                         target="_blank" 
                         class="file-link">
                        <i class="pi pi-external-link"></i> Open Link
                      </a>
                      <template v-else>
                        <a v-if="isViewableFile(submission.file_path)"
                           :href="getFileUrl(submission.file_path)"
                           target="_blank"
                           class="file-link">
                          <i class="pi pi-eye"></i> View
                        </a>
                        <a :href="getFileUrl(submission.file_path)"
                           download
                           class="file-link">
                          <i class="pi pi-download"></i> Download
                        </a>
                      </template>
                    </div>
                  </div>
                </div>

                <div v-if="submission.external_link" class="link-content">
                  <h3>External Link</h3>
                  <a :href="submission.external_link" target="_blank" class="external-link">
                    <i class="pi pi-external-link"></i> Open Link
                  </a>
                </div>
              </div>
            </div>

            <!-- Grading Section -->
            <div class="grading-section">
              <h2>Grading</h2>
              <div class="grade-form">
                <div class="form-group">
                  <label for="grade">Grade (out of {{ exam.total_points }})</label>
                  <input 
                    type="number" 
                    id="grade" 
                    v-model="grade" 
                    :max="exam.total_points"
                    :disabled="submission.status === 'Graded'"
                  />
                </div>
                <div class="form-group">
                  <label for="feedback">Feedback</label>
                  <textarea 
                    id="feedback" 
                    v-model="feedback" 
                    rows="4"
                    :disabled="submission.status === 'Graded'"
                    placeholder="Enter feedback for the student..."
                  ></textarea>
                </div>
                <button 
                  class="submit-grade-btn" 
                  @click="submitGrade"
                  :disabled="submission.status === 'Graded'"
                >
                  <i class="pi pi-check"></i> Submit Grade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/faculty/SideBar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      submission: null,
      exam: null,
      loading: true,
      error: null,
      grade: null,
      feedback: '',
      isSidebarCollapsed: false
    };
  },
  methods: {
    async fetchSubmissionDetails() {
      try {
        const submissionId = this.$route.params.submissionId;
        const response = await axios.get(`http://127.0.0.1:8000/api/exam-submission/${submissionId}`);
        this.submission = response.data;
        this.submission.status = this.submission.grade !== null ? 'Graded' : 'Submitted';
        
        // Fetch exam details
        const examResponse = await axios.get(`http://127.0.0.1:8000/api/exams/item/${this.submission.exam_id}`);
        this.exam = examResponse.data;
        
        // If already graded, set the grade and feedback
        if (this.submission.grade !== null) {
          this.grade = this.submission.grade;
          this.feedback = this.submission.feedback || '';
        }
      } catch (error) {
        console.error("Error fetching submission details:", error);
        this.error = "Failed to load submission details. Please try again later.";
        const toast = useToast();
        toast.error("Failed to load submission details");
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return 'N/A';
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    getStatusClass(status) {
      switch (status?.toLowerCase()) {
        case 'submitted':
          return 'submitted';
        case 'graded':
          return 'graded';
        case 'pending':
          return 'pending';
        default:
          return 'unknown';
      }
    },
    async submitGrade() {
      if (!this.grade || this.grade < 0 || this.grade > this.exam.total_points) {
        const toast = useToast();
        toast.error('Please enter a valid grade');
        return;
      }

      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/exam-submission/${this.submission.submission_id}/grade`,
          {
            grade: this.grade,
            feedback: this.feedback
          }
        );
        
        this.submission.status = 'Graded';
        this.submission.grade = this.grade;
        this.submission.feedback = this.feedback;
        
        const toast = useToast();
        toast.success('Grade submitted successfully');
      } catch (error) {
        console.error("Error submitting grade:", error);
        const toast = useToast();
        toast.error('Failed to submit grade. Please try again later.');
      }
    },
    goBack() {
      this.$router.push({
        name: 'ExamSubmissions',
        params: { 
          courseId: this.$route.params.courseId,
          examId: this.$route.params.examId 
        }
      });
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    getFileName(filePath) {
      if (!filePath) return '';
      return filePath.split('/').pop();
    },
    isExternalLink(filePath) {
      return filePath && (filePath.startsWith('http://') || filePath.startsWith('https://'));
    },
    getFileUrl(filePath) {
      if (!filePath) return '';
      if (this.isExternalLink(filePath)) {
        return filePath;
      }
      const fileName = this.getFileName(filePath);
      return `http://127.0.0.1:8000/api/exams/download/${encodeURIComponent(fileName)}`;
    },
    isViewableFile(filePath) {
      if (!filePath || this.isExternalLink(filePath)) return false;
      const fileName = this.getFileName(filePath).toLowerCase();
      const viewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'];
      return viewableExtensions.some(ext => fileName.endsWith(ext));
    }
  },
  mounted() {
    this.fetchSubmissionDetails();
  }
};
</script>

<style scoped>
.submission-details-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.submission-content {
  display: flex;
  flex: 1;
}

.submission-main {
  flex: 1;
  padding: 2rem;
  background-color: #fff;
  overflow-y: auto;
}

.header-section {
  margin-bottom: 2rem;
}

.header-section h1 {
  font-size: 1.8rem;
  color: #333;
  margin: 1rem 0;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  color: #007BF6;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.submission-content-wrapper {
  display: flex;
  gap: 2rem;
  width: 100%;
}

.student-info-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.submission-content-section,
.grading-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.4rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label {
  color: #666;
  font-size: 0.9rem;
}

.value {
  color: #333;
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.9rem;
  display: inline-block;
}

.status-badge.submitted {
  background-color: #4CAF50;
  color: white;
}

.status-badge.pending {
  background-color: #FFDD57;
  color: black;
}

.status-badge.graded {
  background-color: #2196F3;
  color: white;
}

.status-badge.unknown {
  background-color: #666;
  color: white;
}

.content-box {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
}

.text-content,
.file-content,
.link-content {
  margin-bottom: 1rem;
}

.text-content h3,
.file-content h3,
.link-content h3 {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.file-link,
.external-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #007BF6;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: #e3f2fd;
}

.file-link:hover,
.external-link:hover {
  background-color: #bbdefb;
}

.grade-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.file-preview,
.link-preview {
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.file-info,
.link-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.file-name,
.link-url {
  color: #333;
  font-size: 0.9rem;
  word-break: break-all;
}

.form-group label {
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.submit-grade-btn {
  align-self: flex-start;
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.submit-grade-btn:hover {
  background-color: #45a049;
}

.submit-grade-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.loading-message,
.error-message {
  text-align: center;
  padding: 2rem;
  color: #666;
  font-size: 1.1rem;
}

.error-message {
  color: #dc3545;
}
</style>
