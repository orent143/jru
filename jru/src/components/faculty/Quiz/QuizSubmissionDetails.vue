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
          <h1>Quiz Submission Details</h1>
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
                <span class="value">{{ submission.grade }}/{{ quiz.total_points }}</span>
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
                  <label for="grade">Grade (out of {{ quiz.total_points }})</label>
                  <input 
                    type="number" 
                    id="grade" 
                    v-model="grade" 
                    :max="quiz.total_points"
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

          <!-- Add Comments Section -->
          <div class="comments-section">
            <h2>Comments</h2>
            <div class="comment-input">
              <textarea 
                v-model="newComment" 
                placeholder="Add a comment..."
                :disabled="loading"
                rows="3"
              ></textarea>
              <button 
                class="post-comment-btn" 
                @click="postComment"
                :disabled="!newComment.trim() || loading"
              >
                <i class="pi pi-send"></i> Post Comment
              </button>
            </div>
            
            <!-- Loading state -->
            <div v-if="isLoadingComments" class="comments-loading">
              <div class="loading-spinner"></div>
              <p>Loading comments...</p>
            </div>
            
            <!-- No comments state -->
            <div v-else-if="comments.length === 0" class="no-comments">
              <p>No comments yet.</p>
            </div>
            
            <!-- Comments list -->
            <div v-else class="comments-list">
              <div v-for="comment in comments" :key="comment.comment_id" class="comment">
                <div class="comment-avatar">
                  <i class="pi pi-user"></i>
                </div>
                <div class="comment-content">
                  <div class="comment-header">
                    <h4>{{ comment.user_name }}</h4>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                    
                    <!-- Delete button for own comments -->
                    <button 
                      v-if="comment.user_id === userId" 
                      class="delete-comment-btn"
                      @click="deleteComment(comment.comment_id)"
                    >
                      <i class="pi pi-trash"></i>
                    </button>
                  </div>
                  <p class="comment-text">{{ comment.content }}</p>
                </div>
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
      quiz: null,
      loading: true,
      error: null,
      grade: null,
      feedback: '',
      isSidebarCollapsed: false,
      comments: [],
      isLoadingComments: false,
      newComment: '',
      userId: null
    };
  },
  methods: {
    async fetchSubmissionDetails() {
      try {
        const submissionId = this.$route.params.submissionId;
        const response = await axios.get(`http://127.0.0.1:8000/api/quiz-submission/${submissionId}`);
        this.submission = response.data;
        this.submission.status = this.submission.grade !== null ? 'Graded' : 'Submitted';
        
        // Fetch quiz details
        const quizResponse = await axios.get(`http://127.0.0.1:8000/api/quizzes/item/${this.submission.quiz_id}`);
        this.quiz = quizResponse.data;
        
        // If already graded, set the grade and feedback
        if (this.submission.grade !== null) {
          this.grade = this.submission.grade;
          this.feedback = this.submission.feedback || '';
        }
        
        // Fetch comments for this quiz
        await this.fetchComments();
      } catch (error) {
        console.error("Error fetching submission details:", error);
        this.error = "Failed to load submission details. Please try again later.";
        const toast = useToast();
        toast.error("Failed to load submission details");
      } finally {
        this.loading = false;
      }
    },
    
    async fetchComments() {
      try {
        this.isLoadingComments = true;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/quiz/${this.submission.quiz_id}`
        );
        this.comments = response.data;
        this.isLoadingComments = false;
      } catch (error) {
        console.error("Error fetching comments:", error);
        const toast = useToast();
        toast.error("Failed to load comments");
        this.isLoadingComments = false;
      }
    },
    
    async postComment() {
      if (!this.newComment.trim()) return;
      
      try {
        const toast = useToast();
        
        const commentData = {
          user_id: this.userId,
          entity_type: "quiz",
          entity_id: this.quiz.quiz_id,
          content: this.newComment
        };
        
        const response = await axios.post(
          "http://127.0.0.1:8000/api/comments/",
          commentData
        );
        
        if (response.status === 200) {
          toast.success("Comment posted successfully");
          this.newComment = "";
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error posting comment:", error);
        const toast = useToast();
        toast.error("Failed to post comment");
      }
    },
    
    async deleteComment(commentId) {
      try {
        const toast = useToast();
        
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/comments/${commentId}?user_id=${this.userId}`
        );
        
        if (response.status === 200) {
          toast.success("Comment deleted successfully");
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        const toast = useToast();
        toast.error("Failed to delete comment");
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
      if (!this.grade || this.grade < 0 || this.grade > this.quiz.total_points) {
        const toast = useToast();
        toast.error('Please enter a valid grade');
        return;
      }

      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/quiz-submission/${this.submission.submission_id}/grade`,
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
        name: 'QuizSubmissions',
        params: { 
          quizId: this.$route.params.quizId 
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
      return `http://127.0.0.1:8000/api/quizzes/download/${encodeURIComponent(fileName)}`;
    },
    isViewableFile(filePath) {
      if (!filePath || this.isExternalLink(filePath)) return false;
      const fileName = this.getFileName(filePath).toLowerCase();
      const viewableExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'];
      return viewableExtensions.some(ext => fileName.endsWith(ext));
    }
  },
  mounted() {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.userId = user.user_id;
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }
    
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
.student-info-section{
    background-color: #fff;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.submission-content-section {
  flex: 2;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grading-section {
  flex: 1;
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: fit-content;
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

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007BF6;
  box-shadow: 0 0 0 2px rgba(0, 123, 246, 0.1);
}

.submit-grade-btn {
  align-self: flex-start;
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
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

/* Comments section styles */
.comments-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comment-input textarea {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #007BF6;
  box-shadow: 0 0 0 2px rgba(0, 123, 246, 0.1);
}

.post-comment-btn {
  align-self: flex-end;
  background-color: #007BF6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.post-comment-btn:hover:not(:disabled) {
  background-color: #0056b3;
}

.post-comment-btn:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.comments-loading, .no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6c757d;
}

.loading-spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007BF6;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comment {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.5rem;
}

.comment-avatar {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-avatar i {
  font-size: 20px;
  color: #6c757d;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.comment-header h4 {
  font-size: 0.9rem;
  font-weight: 600;
  color: #333;
  margin: 0;
  margin-right: 0.5rem;
}

.comment-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.delete-comment-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  opacity: 0.5;
  padding: 0.25rem;
  font-size: 0.8rem;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.comment-text {
  font-size: 0.9rem;
  color: #333;
  line-height: 1.5;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>    