<template>
  <div class="quiz-details-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="quiz-detail">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <div class="quiz-detail-container" v-if="currentQuiz">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="quiz-content">
          <div class="main-content">
            <div class="quiz-header">
              <div class="header-content">
                <h1>{{ currentQuiz.title }}</h1>
                <div class="quiz-meta">
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i>
                    Posted: {{ formatDate(currentQuiz.quiz_date) }}
                  </span>
                  <span class="status" :class="getQuizStatus(currentQuiz)">
                    {{ getQuizStatus(currentQuiz) }}
                  </span>
                </div>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <div class="instruction-content">
                <p>{{ currentQuiz.description }}</p>
                <div class="attachments" v-if="currentQuiz.external_link">
                  <h3>External Link</h3>
                  <div class="attachment-item" @click="openExternalLink(currentQuiz.external_link)">
                    <i class="pi pi-link"></i>
                    <span>{{ currentQuiz.external_link }}</span>
                    <i class="pi pi-external-link"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section submission">
              <h2>Your Work</h2>
              <div v-if="existingSubmission" class="submission-area">
                <div class="existing-submission">
                  <h3>Your Submission</h3>
                  <div v-if="existingSubmission.file_path" class="attachment-item">
                    <i class="pi pi-file"></i>
                    <span>{{ getFileName(existingSubmission.file_path) }}</span>
                    <button @click="downloadFile(existingSubmission.file_path)" class="download-btn">
                      <i class="pi pi-download"></i>
                    </button>
                  </div>
                  <div v-if="existingSubmission.external_link" class="attachment-item">
                    <i class="pi pi-link"></i>
                    <a :href="existingSubmission.external_link" target="_blank">{{ existingSubmission.external_link }}</a>
                  </div>
                  <div v-if="existingSubmission.submission_text" class="submission-text">
                    <p>{{ existingSubmission.submission_text }}</p>
                  </div>
                  <button @click="confirmDeleteSubmission" class="delete-btn">
                    <i class="pi pi-trash"></i> Delete Submission
                  </button>
                </div>
              </div>
              <form v-else @submit.prevent="confirmSubmitQuiz" enctype="multipart/form-data">
                <div class="submission-area">
                  <div class="submission-type-selector">
                    <label for="submissionType">Choose Submission Type:</label>
                    <select v-model="submissionType" id="submissionType" class="submission-dropdown">
                      <option value="">Select submission type</option>
                      <option value="file">Upload File</option>
                      <option value="link">External Link</option>
                    </select>
                  </div>

                  <div class="submission-inputs" v-if="submissionType">
                    <div v-if="submissionType === 'file'" class="file-upload-container">
                      <label class="file-upload-label">
                        <input 
                          type="file" 
                          @change="handleFileChange" 
                          class="file-input"
                        />
                        <span class="file-upload-text">
                          <i class="pi pi-upload"></i>
                          {{ selectedFile ? selectedFile.name : 'Choose file to upload' }}
                        </span>
                      </label>
                    </div>

                    <div v-if="submissionType === 'link'" class="link-input-container">
                      <input 
                        type="text" 
                        v-model="externalLink" 
                        placeholder="Enter external link here" 
                        class="link-input"
                      />
                    </div>

                    <div class="text-area-container">
                      <textarea 
                        v-model="submissionText" 
                        placeholder="Add submission text..." 
                        required
                        class="submission-textarea"
                      ></textarea>
                    </div>

                    <button type="submit" class="submit-btn">
                      <i class="pi pi-upload"></i> Submit Quiz
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div class="content-section comments">
              <h2>Class Comments</h2>
              <div class="comments-section">
                <div class="comment-input">
                  <input 
                    type="text" 
                    v-model="newComment" 
                    placeholder="Add class comment..." 
                    @keyup.enter="confirmAddComment" 
                  />
                  <button class="send-btn" @click="confirmAddComment">
                    <i class="pi pi-send"></i>
                  </button>
                </div>

                <!-- Loading state -->
                <div v-if="isLoadingComments" class="comments-loading">
                  <div class="loading-spinner"></div>
                  <p>Loading comments...</p>
                </div>
              
                <!-- No comments state -->
                <div v-else-if="comments.length === 0" class="no-comments">
                  <p>No comments yet. Be the first to comment!</p>
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
                          v-if="comment.user_id === student.user_id" 
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
    </div>
  </div>

  <ConfirmationModal
    :show="showSubmitConfirmation"
    title="Submit Quiz"
    message="Are you sure you want to submit this quiz? This action cannot be undone."
    confirmText="Submit"
    type="primary"
    @confirm="handleQuizSubmission"
    @cancel="showSubmitConfirmation = false"
  />

  <ConfirmationModal
    :show="showCommentConfirmation"
    title="Post Comment"
    message="Are you sure you want to post this comment?"
    confirmText="Post"
    type="primary"
    @confirm="handleCommentSubmission"
    @cancel="showCommentConfirmation = false"
  />

  <ConfirmationModal
    :show="showDeleteConfirmation"
    title="Delete Submission"
    message="Are you sure you want to delete this submission? This action cannot be undone."
    confirmText="Delete"
    type="danger"
    @confirm="handleDeleteSubmission"
    @cancel="showDeleteConfirmation = false"
  />
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';
import { useToast } from "vue-toastification";  // Importing toast
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  name: 'QuizDetails',
  components: {
    Header,
    Sidebar,
    ConfirmationModal
  },
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [],
      currentQuiz: null,
      comments: [],
      newComment: '',
      toast: useToast(),
      showSubmitConfirmation: false,
      showCommentConfirmation: false,
      showDeleteConfirmation: false,
      pendingComment: '',
      submissionType: '',
      selectedFile: null,
      externalLink: '',
      submissionText: '',
      existingSubmission: null,
      isLoadingComments: false
    };
  },
  async created() {
    await this.fetchQuizDetails();
    await this.fetchExistingSubmission();
    await this.fetchComments();
  },
  methods: {
    async fetchQuizDetails() {
      try {
        if (!this.student) {
          this.$router.push('/');
          return;
        }

        const studentId = this.student.user_id;
        const courseId = parseInt(this.$route.params.courseId);
        const token = this.student.access_token;

        if (!token) {
          console.error("No authentication token found.");
          this.$router.push("/");
          return;
        }
        
        const response = await axios.get(
          `http://127.0.0.1:8000/api/student_quizzes/${studentId}/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (response.status === 200) {
          const quizId = parseInt(this.$route.params.quizId);
          const data = response.data;

          this.courses = [{
            id: courseId,
            name: data.course_name,
            quizzes: data.quizzes
          }];

          this.currentQuiz = data.quizzes.find(q => q.quiz_id === quizId);

          if (!this.currentQuiz) {
            console.error('Quiz not found');
            this.toast.error('Quiz not found');
          }
        }
      } catch (error) {
        console.error('Error fetching quiz details:', error);
        if (error.response?.status === 401 || error.response?.status === 403) {
          this.$router.push("/");
        }
        this.toast.error('Failed to fetch quiz details');
      }
    },

    async fetchExistingSubmission() {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/quiz-submission/${this.currentQuiz.quiz_id}/${this.student.user_id}`
        );
        if (response.data.submission_id) {
          const submissionDetails = await axios.get(
            `http://127.0.0.1:8000/api/quiz-submission/${response.data.submission_id}`
          );
          this.existingSubmission = submissionDetails.data;
        }
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching existing submission:", error);
          this.toast.error("Error fetching submission details");
        }
      }
    },

    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },

    getFileName(path) {
      return path ? path.split('/').pop() : '';
    },

    async downloadFile(fileUrl) {
      const formattedUrl = fileUrl.replace(/\\/g, '/');
      if (formattedUrl.startsWith('http')) {
        window.open(formattedUrl, '_blank');
      } else {
        const fileName = this.getFileName(formattedUrl);
        window.open(`http://127.0.0.1:8000/api/download/${fileName}`, '_blank');
      }
    },

    async confirmSubmitQuiz() {
      if (!this.submissionType) {
        this.toast.error("Please select a submission type");
        return;
      }

      if (this.submissionType === 'file' && !this.selectedFile) {
        this.toast.error("Please select a file to upload");
        return;
      }

      if (this.submissionType === 'link' && !this.externalLink) {
        this.toast.error("Please provide an external link");
        return;
      }

      if (!this.submissionText.trim()) {
        this.toast.error("Please provide submission text");
        return;
      }

      this.showSubmitConfirmation = true;
    },

    async handleQuizSubmission() {
      this.showSubmitConfirmation = false;
      try {
        const formData = new FormData();
        formData.append('student_id', this.student.user_id);
        formData.append('quiz_id', this.currentQuiz.quiz_id);
        formData.append('submission_text', this.submissionText);

        if (this.submissionType === 'file' && this.selectedFile) {
          formData.append('file', this.selectedFile);
        } else if (this.submissionType === 'link' && this.externalLink) {
          formData.append('external_link', this.externalLink);
        }

        const response = await axios.post('http://127.0.0.1:8000/api/submit-quiz/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status === 200) {
          this.toast.success('Quiz submitted successfully!');
          await this.fetchExistingSubmission();
        }
      } catch (error) {
        console.error('Error submitting quiz:', error);
        this.toast.error(error.response?.data?.detail || 'Failed to submit quiz. Please try again.');
      }
    },

    confirmAddComment() {
      if (!this.newComment.trim()) return;
      this.pendingComment = this.newComment;
      this.showCommentConfirmation = true;
    },

    async handleCommentSubmission() {
      this.showCommentConfirmation = false;
      try {
        if (!this.pendingComment.trim()) return;
        
        const commentData = {
          user_id: this.student.user_id,
          entity_type: "quiz",
          entity_id: parseInt(this.$route.params.quizId),
          content: this.pendingComment
        };
        
        const response = await axios.post(
          "http://127.0.0.1:8000/api/comments/",
          commentData
        );
        
        if (response.status === 200) {
          this.toast.success("Comment added successfully!");
          this.newComment = "";
          this.pendingComment = "";
          await this.fetchComments(); // Refresh comments
        }
      } catch (error) {
        console.error("Error adding comment:", error);
        this.toast.error("Failed to add comment");
      }
    },

    openExternalLink(url) {
      window.open(url, '_blank');
    },

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A';
    },

    goBack() {
      this.$router.push({
        name: 'QuizContent',
        params: { courseId: this.$route.params.courseId }
      });
    },

    confirmDeleteSubmission() {
      this.showDeleteConfirmation = true;
    },

    async handleDeleteSubmission() {
      this.showDeleteConfirmation = false;
      try {
        const token = this.student.access_token;
        await axios.delete(
          `http://127.0.0.1:8000/api/quiz-submission/${this.existingSubmission.submission_id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );
        this.toast.success("Submission deleted successfully!");
        this.existingSubmission = null;
      } catch (error) {
        console.error("Error deleting submission:", error);
        this.toast.error(error.response?.data?.detail || "Failed to delete submission. Please try again.");
      }
    },

    getQuizStatus(quiz) {
      return this.existingSubmission ? 'Submitted' : 'Not Submitted';
    },

    async fetchComments() {
      try {
        this.isLoadingComments = true;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/quiz/${this.$route.params.quizId}`
        );
        this.comments = response.data;
        this.isLoadingComments = false;
      } catch (error) {
        console.error("Error fetching comments:", error);
        this.toast.error("Failed to load comments");
        this.isLoadingComments = false;
      }
    },

    async deleteComment(commentId) {
      try {
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/comments/${commentId}?user_id=${this.student.user_id}`
        );
        
        if (response.status === 200) {
          this.toast.success("Comment deleted successfully!");
          await this.fetchComments(); // Refresh comments
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        this.toast.error("Failed to delete comment");
      }
    }
  }
};
</script>

<style scoped>
.quiz-details-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.quiz-detail {
  display: flex;
  flex: 1;
}

.quiz-detail-container {
  flex: 1;
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto; /* This will enable vertical scrolling */
  max-height: 100%;
  background-color: #fff;
  /* Set a maximum height for the container */
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.back-btn:hover {
  background-color: #f0f0f0;
}

.quiz-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  height: 100%; /* Ensure content takes up full height */
  margin-bottom: 5rem; /* Add bottom margin here */
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.side-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem; /* Add bottom margin here */
}

.quiz-header {
  background-color: #D9D9D9;
  padding: 2rem;
  border-radius: 8px;
}

.quiz-header h1 {
  color: #333;
}

.quiz-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: #666;
}

.content-section {
  background-color: #D9D9D9;
  padding: 1.5rem;
  border-radius: 8px;
  min-height: 300px;
  color: #212121;
}

.content-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #333;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.attachment-item i {
  font-size: 1.25rem;
}

.comments-section {
  display: flex;
  flex-direction: column;
}

.comment-input {
  display: flex;
  gap: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.send-btn {
  background-color: #2c3e50;
  color: white;
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}

.send-btn:hover {
  background-color: #1a252f;
}

.comments-list {
  margin-top: 1rem;
}

.comment {
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #ddd;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.comment-content {
  display: flex;
  flex-direction: column;
}

.comment-header h4 {
  font-size: 1rem;
  margin-bottom: 0.2rem;
  color: #333;
}

.comment-date {
  font-size: 0.875rem;
  color: #888;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 12px;
}

.primary {
  background-color: #007bff;
}

.status.indicator {
  background-color: #f39c12;
}

.submission-actions button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 20px;
  font-size: 100%;
  font-weight: 800;
  background-color: #F5F5F5;
  color: rgba(0, 0, 0, 0.781);
  cursor: pointer;
  display: flex
;
  font-family: 'Inter', sans-serif;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.existing-submission {
  background-color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.delete-btn {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.delete-btn:hover {
  background-color: #c82333;
}

.download-btn {
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.download-btn:hover {
  background-color: #e9ecef;
}

.submission-text {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 4px;
  margin-top: 1rem;
}

.submission-type-selector {
  margin-bottom: 1.5rem;
}

.submission-dropdown {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
}

.submission-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-upload-container {
  width: 100%;
}

.file-upload-label {
  display: block;
  width: 100%;
  padding: 1rem;
  background-color: #f8f9fa;
  border: 2px dashed #ccc;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
}

.file-upload-label:hover {
  border-color: #007bff;
  background-color: #f1f8ff;
}

.file-input {
  display: none;
}

.link-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
}

.submission-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s;
}

.submit-btn:hover {
  background-color: #0056b3;
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

.comment-avatar {
  width: 40px;
  height: 40px;
  background-color: #e9ecef;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.comment-avatar i {
  font-size: 20px;
  color: #6c757d;
}

.comment-header {
  display: flex;
  align-items: center;
}

.comment-date {
  margin-left: 0.5rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.delete-comment-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.2s;
}

.delete-comment-btn:hover {
  opacity: 1;
}

.comment-text {
  margin-top: 0.5rem;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>