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
                <div class="attachments" v-if="currentQuiz.file_path">
                  <h3>Attachments:</h3>
                  <div v-if="isExternalLink(currentQuiz.file_path)" class="attachment-item" @click="openExternalLink(currentQuiz.file_path)">
                    <i class="pi pi-link"></i>
                    <a :href="currentQuiz.file_path" target="_blank">{{ currentQuiz.file_path }}</a>
                  </div>
                  <div v-else class="attachment-item" @click="downloadQuizFile(currentQuiz.file_path)">
                    <i class="pi pi-file"></i>
                    <span>{{ getFileName(currentQuiz.file_path) }}</span>
                    <i class="pi pi-download"></i>
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
                  <div class="submission-header">
                    <h3>Your Submission</h3>
                    <div v-if="existingSubmission.grade !== null" class="grade-display">
                      <span class="grade-label">Grade:</span>
                      <span class="grade-value">{{ existingSubmission.grade }}/</span>
                    </div>
                  </div>
                  <div v-if="existingSubmission.feedback" class="feedback-container">
                    <h4>Feedback:</h4>
                    <p>{{ existingSubmission.feedback }}</p>
                  </div>

                  <div v-if="existingSubmission.file_path" class="attachment-item">
                    <i class="pi" :class="isExternalLink(existingSubmission.file_path) ? 'pi-link' : 'pi-file'"></i>
                    <span>{{ isExternalLink(existingSubmission.file_path) ? existingSubmission.file_path : getFileName(existingSubmission.file_path) }}</span>
                    <button @click="downloadFile(existingSubmission.file_path)" class="download-btn">
                      <i class="pi" :class="isExternalLink(existingSubmission.file_path) ? 'pi-external-link' : 'pi-download'"></i>
                    </button>
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
              
              <div v-if="isLoadingComments" class="comments-loading">
                <div class="loading-spinner"></div>
                <p>Loading comments...</p>
              </div>
              
              <div v-else-if="comments.length === 0" class="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
              
              <div v-else class="comments-list">
                <div v-for="comment in comments" :key="comment.comment_id" class="comment">
                  <div class="comment-avatar">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="comment-content">
                    <div class="comment-header">
                      <h4>{{ comment.user_name }}</h4>
                      <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                      
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
              
              <div class="comment-input">
                <textarea
                  v-model="newComment"
                  placeholder="Add a comment..."
                  rows="3"
                ></textarea>
                <button
                  class="post-comment-btn"
                  @click="confirmAddComment"
                  :disabled="!newComment.trim()"
                >
                  <i class="pi pi-send"></i> Post Comment
                </button>
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
import { useToast } from "vue-toastification";
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
      if (!path) return '';
      if (this.isExternalLink(path)) return path;
      return path.split('/').pop();
    },

    async downloadFile(filePath) {
      if (this.isExternalLink(filePath)) {
        window.open(filePath, '_blank');
        return;
      }
      
      const formattedUrl = filePath.replace(/\\/g, '/');
      const fileName = this.getFileName(formattedUrl);
      window.open(`http://127.0.0.1:8000/api/quizzes/download/${fileName}`, '_blank');
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
          await this.fetchComments();
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
          await this.fetchComments();
        }
      } catch (error) {
        console.error("Error deleting comment:", error);
        this.toast.error("Failed to delete comment");
      }
    },

    async downloadQuizFile(filePath) {
      const fileName = this.getFileName(filePath);
      if (fileName) {
        window.open(`http://127.0.0.1:8000/api/quizzes/download/${fileName}`, '_blank');
      }
    },

    isExternalLink(path) {
      return path && (path.startsWith('http://') || path.startsWith('https://'));
    }
  }
};
</script>

<style scoped>
.quiz-details-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.quiz-detail {
  display: flex;
  flex: 1;
  overflow: hidden;
  background-color: #f5f7fa;
}

.quiz-detail-container {
  flex: 1;
  padding: 1.5rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
  background-color: #f5f7fa;
  position: relative;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 1.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  font-weight: 500;
  color: #4a5568;
}

.back-btn:hover {
  background-color: rgba(0, 123, 246, 0.8);
  color: #ffffff;
  transform: translateX(5px);
}

.quiz-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  padding-bottom: 2rem;
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
  margin-bottom: 2rem;
}

.quiz-header {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.quiz-header h1 {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.quiz-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: #718096;
}

.quiz-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.content-section {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  min-height: 300px;
  color: #212121;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.content-section h2 {
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
  color: #2d3748;
  font-weight: 600;
}

.attachments h3 {
  font-weight: bold;
  color: #2d3748;
  margin: 1.5rem 0 1rem;
  font-size: 1.1rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  margin-bottom: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #edf2f7;
}

.attachment-item:hover {
  background-color: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.attachment-item a {
  color: #4299e1;
  text-decoration: none;
  font-weight: 500;
}

.attachment-item a:hover {
  text-decoration: underline;
}

.attachment-item span {
  color: #4a5568;
  font-weight: 500;
  flex: 1;
}

.attachment-item i {
  font-size: 1.25rem;
  color: #4a5568;
}

.comments-section {
  display: flex;
  flex-direction: column;
}

.comment-input {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  margin-top: 1.5rem;
}

.comment-input textarea {
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.comment-input textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

.post-comment-btn {
  align-self: flex-end;
  background-color: #4299e1;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.post-comment-btn:hover:not(:disabled) {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.post-comment-btn:disabled {
  background-color: #cbd5e0;
  cursor: not-allowed;
}

.comments-list {
  max-height: 350px;
  overflow-y: auto;
  margin-bottom: 1rem;
  border-radius: 8px;
  padding-right: 0.5rem;
}

.comments-list::-webkit-scrollbar {
  width: 6px;
}

.comments-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 10px;
}

.comments-list::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.comment {
  display: flex;
  gap: 1rem;
  padding: 1.25rem;
  margin-bottom: 0.75rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #edf2f7;
  transition: all 0.2s ease;
}

.comment:hover {
  background-color: #edf2f7;
}

.status {
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 500;
  background-color: #ebf8ff;
  color: #3182ce;
}

.status.indicator {
  background-color: #fffaf0;
  color: #dd6b20;
}

.submission-actions button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  background-color: #ebf8ff;
  color: #4299e1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.submission-actions button:hover {
  background-color: #bee3f8;
  transform: translateY(-1px);
}

.existing-submission {
  background-color: white;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #edf2f7;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.submission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.grade-display {
  background-color: #4299e1;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(66, 153, 225, 0.2);
}

.grade-label {
  margin-right: 0.5rem;
}

.grade-value {
  font-size: 1.1rem;
}

.feedback-container {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.25rem;
  border-left: 4px solid #4299e1;
}

.feedback-container h4 {
  margin-top: 0;
  margin-bottom: 0.75rem;
  color: #2d3748;
  font-weight: 600;
}

.delete-btn {
  background-color: #f56565;
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.25rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background-color: #e53e3e;
  transform: translateY(-1px);
}

.download-btn {
  background: none;
  border: none;
  color: #4299e1;
  cursor: pointer;
  padding: 0.35rem 0.75rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background-color: #ebf8ff;
}

.submission-text {
  background-color: #f9fafb;
  padding: 1.25rem;
  border-radius: 8px;
  margin-top: 1.25rem;
  border: 1px solid #edf2f7;
}

.submission-type-selector {
  margin-bottom: 1.5rem;
}

.submission-dropdown {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: white;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.submission-dropdown:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
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
  background-color: #f9fafb;
  border: 2px dashed #cbd5e0;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all 0.2s ease;
}

.file-upload-label:hover {
  border-color: #4299e1;
  background-color: #ebf8ff;
}

.file-input {
  display: none;
}

.file-upload-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.link-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.link-input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.submission-textarea {
  width: 100%;
  min-height: 100px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  transition: all 0.2s ease;
}

.submission-textarea:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background-color: #4299e1;
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
  transition: all 0.2s ease;
}

.submit-btn:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}

.comments-loading, .no-comments {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  color: #718096;
}

.loading-spinner {
  border: 3px solid #e2e8f0;
  border-top: 3px solid #4299e1;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  animation: spin 1s linear infinite;
  margin-bottom: 0.75rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.comment-avatar {
  width: 45px;
  height: 45px;
  background-color: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.comment-avatar i {
  font-size: 20px;
  color: #718096;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.75rem;
}

.comment-header h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
  margin-right: 0.75rem;
}

.comment-date {
  font-size: 0.85rem;
  color: #718096;
}

.delete-comment-btn {
  margin-left: auto;
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  opacity: 0.6;
  padding: 0.35rem;
  font-size: 0.85rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.delete-comment-btn:hover {
  opacity: 1;
  background-color: #fed7d7;
}

.comment-text {
  font-size: 0.95rem;
  color: #4a5568;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>