<template>
  <div class="assignmentdetail-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="assignment-detail">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <div class="assignment-detail-container" v-if="currentAssignment">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="assignment-content">
          <div class="main-content">
            <div class="assignment-header">
              <h1>{{ currentAssignment.title }}</h1>
              <div class="assignment-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> 
                  Posted: {{ formatDate(currentAssignment.created_at) }}
                </span>
                <span class="due-date">
                  <i class="pi pi-clock"></i> 
                  Due: {{ formatDate(currentAssignment.due_date) }}
                </span>
                <span class="status" :class="getAssignmentStatus(currentAssignment)">
                  {{ getAssignmentStatus(currentAssignment) }}
                </span>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <p>{{ currentAssignment.description }}</p>

              <!-- Attachments Section -->
              <div v-if="currentAssignment.file_path || currentAssignment.external_link" class="attachments">
                <h3>Attachments</h3>

                <!-- Local File Attachment -->
                <div v-if="currentAssignment.file_path" class="attachment-item" @click="downloadFile(currentAssignment.file_path)">
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentAssignment.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
                <!-- External Link -->
                <div v-if="currentAssignment.external_link" class="attachment-item">
                  <i class="pi pi-link"></i>
                  <a :href="currentAssignment.external_link" target="_blank">{{ getFileName(currentAssignment.external_link) }}</a>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section submission">
              <h2>Your Work</h2>

              <!-- Display existing submission if available -->
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

              <!-- Submission Form -->
              <form v-else @submit.prevent="confirmSubmitAssignment" enctype="multipart/form-data">
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
                    <!-- File Upload Input -->
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

                    <!-- External Link Input -->
                    <div v-if="submissionType === 'link'" class="link-input-container">
                      <input 
                        type="text" 
                        v-model="externalLink" 
                        placeholder="Enter external link here" 
                        class="link-input"
                      />
                    </div>

                    <!-- Submission Text Area -->
                    <div class="text-area-container">
                      <textarea 
                        v-model="submissionText" 
                        placeholder="Add submission text..." 
                        required
                        class="submission-textarea"
                      ></textarea>
                    </div>

                    <button type="submit" class="submit-btn">
                      <i class="pi pi-upload"></i> Submit Assignment
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div class="content-section comments">
              <h2>Class Comments</h2>
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
                        v-if="comment.user_id === studentId" 
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

  <!-- Add confirmation modals at the end of the template -->
  <ConfirmationModal
    :show="showSubmitConfirmation"
    title="Submit Assignment"
    message="Are you sure you want to submit this assignment? This action cannot be undone."
    confirmText="Submit"
    type="primary"
    @confirm="handleAssignmentSubmission"
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
  name: 'AssignmentDetail',
  components: { 
    Header, 
    Sidebar,
    ConfirmationModal 
  },
  props: ['courseId', 'assignmentId'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      courses: [],
      currentAssignment: null,
      existingSubmission: null,
      newComment: "",
      submissionText: "",
      externalLink: "",
      selectedFile: null,
      submissionType: "",
      showSubmitConfirmation: false,
      showCommentConfirmation: false,
      showDeleteConfirmation: false,
      pendingComment: '',
      comments: [],
      isLoadingComments: false,
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchAssignmentDetail();
      await this.fetchExistingSubmission();
      await this.fetchComments();
    }
  },
  methods: {
    async fetchAssignmentDetail() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/student_assignments/${this.studentId}/${this.courseId}`);
        if (response.data.assignments) {
          this.currentAssignment = response.data.assignments.find(assignment => assignment.assignment_id === parseInt(this.assignmentId)) || null;
        } else {
          this.currentAssignment = null;
        }
      } catch (error) {
        console.error("Error fetching assignment details:", error);
      }
    },

    async fetchExistingSubmission() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/assignment_submissions/${this.assignmentId}`);
        this.existingSubmission = response.data.submissions.find(submission => submission.student_id === this.studentId) || null;
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error("Error fetching existing submission:", error);
          this.toast.error("Error fetching submission details");
        }
      }
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },

    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },

    getFileName(fileUrl) {
      return fileUrl ? fileUrl.split('/').pop() : '';
    },
    
    downloadFile(fileUrl) {
      if (!fileUrl) return;
      
      const formattedUrl = fileUrl.replace(/\\/g, '/'); // Ensure correct path format

      if (formattedUrl.startsWith('http')) {
        // Open external links directly
        window.open(formattedUrl, '_blank');
      } else {
        // Extract file name and initiate download from the API
        const fileName = this.getFileName(formattedUrl);
        const downloadUrl = `http://127.0.0.1:8000/api/download/${fileName}`;
        window.open(downloadUrl, '_blank');
      }
    },
    
    confirmSubmitAssignment(event) {
      event.preventDefault();
      if (!this.submissionType) {
        this.toast.error("Please select a submission type");
        return;
      }
      if (!this.submissionText.trim()) {
        this.toast.error("Please add submission text");
        return;
      }
      if (this.submissionType === 'file' && !this.selectedFile) {
        this.toast.error("Please select a file to upload");
        return;
      }
      if (this.submissionType === 'link' && !this.externalLink.trim()) {
        this.toast.error("Please enter an external link");
        return;
      }
      this.showSubmitConfirmation = true;
    },

    async handleAssignmentSubmission() {
      this.showSubmitConfirmation = false;
      const formData = new FormData();
      formData.append("student_id", this.studentId);
      formData.append("assignment_id", this.assignmentId);
      formData.append("submission_text", this.submissionText);

      if (this.selectedFile) {
        formData.append("file", this.selectedFile);
      }
      
      if (this.externalLink) {
        formData.append("external_link", this.externalLink);
      }

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/submit-assignment/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        this.toast.success("Assignment submitted successfully!");
        this.submissionText = "";
        this.externalLink = "";
        this.selectedFile = null;
        this.submissionType = "";
        await this.fetchExistingSubmission();
      } catch (error) {
        console.error("Error submitting assignment:", error);
        this.toast.error(error.response?.data?.detail || "Failed to submit assignment. Please try again.");
      }
    },

    confirmDeleteSubmission() {
      this.showDeleteConfirmation = true;
    },

    async handleDeleteSubmission() {
      this.showDeleteConfirmation = false;
      try {
        const token = this.student.access_token;
        await axios.delete(
          `http://127.0.0.1:8000/api/assignment-submission/${this.existingSubmission.submission_id}`,
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
          user_id: this.studentId,
          entity_type: "assignment",
          entity_id: parseInt(this.assignmentId),
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

    async fetchComments() {
      try {
        this.isLoadingComments = true;
        const response = await axios.get(
          `http://127.0.0.1:8000/api/comments/assignment/${this.assignmentId}`
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
          `http://127.0.0.1:8000/api/comments/${commentId}?user_id=${this.studentId}`
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

    getAssignmentStatus(assignment) {
      return this.existingSubmission ? 'Submitted' : 'Not Submitted';
    },

    goBack() {
      this.$router.go(-1);
    }
  }
};
</script>

<style scoped>
.assignment-detail-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.assignment-detail {
  display: flex;
  flex: 1;
}

.assignment-detail-container {
  flex: 1;
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto;
  max-height: 100%;
  background-color: #fff;
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

.assignment-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  height: 100%;
  margin-bottom: 5rem;
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

.assignment-header {
  background-color: #D9D9D9;
  padding: 2rem;
  border-radius: 8px;
}

.assignment-header h1 {
  color: #333;
}

.assignment-meta {
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

.file-upload-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
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

.submission-message {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: #f8d7da;
  color: #721c24;
  text-align: center;
}

.submission-message.success {
  background-color: #d4edda;
  color: #155724;
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

.status.indicator {
  background-color: #f39c12;
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
