<template>
  <div class="exam-details-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />

    <div class="exam-detail">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <div class="exam-detail-container" v-if="currentExam">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="exam-content">
          <div class="main-content">
            <div class="exam-header">
              <h1>{{ currentExam.title }}</h1>
              <div class="exam-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> Posted: {{ formatDate(currentExam.exam_date) }}
                </span>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <p>{{ currentExam.description }}</p>

              <!-- Attachments Section -->
              <div v-if="currentExam.file_url || currentExam.external_link" class="attachments">
                <h3>Attachments</h3>

                <!-- Local File Attachment -->
                <div v-if="currentExam.file_url" class="attachment-item" @click="downloadFile(currentExam.file_url)">
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentExam.file_url) }}</span>
                  <i class="pi pi-download"></i>
                </div>

                <!-- External Link -->
                <div v-if="currentExam.external_link" class="attachment-item">
                  <i class="pi pi-link"></i>
                  <a :href="currentExam.external_link" target="_blank">{{ getFileName(currentExam.external_link) }}</a>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section submission">
              <h2>Your Work</h2>

              <!-- Submission Form -->
              <form @submit.prevent="confirmSubmitExam" enctype="multipart/form-data">
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
              <div class="comments-section">
                <div class="comment-input">
                  <input type="text" v-model="newComment" placeholder="Add class comment..."
                         @keyup.enter="confirmAddComment" />
                  <button class="send-btn" @click="confirmAddComment">
                    <i class="pi pi-send"></i>
                  </button>
                </div>
                <div class="comments-list" v-if="currentExam.comments?.length">
                  <div v-for="comment in currentExam.comments" :key="comment.id" class="comment">
                    <img :src="comment.authorAvatar || '/default-avatar.png'" :alt="comment.author" />
                    <div class="comment-content">
                      <div class="comment-header">
                        <h4>{{ comment.author }}</h4>
                        <span class="comment-date">{{ formatDate(comment.date) }}</span>
                      </div>
                      <p>{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
                <p v-else>No comments yet.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="loading">Loading exam details...</div>
    </div>

    <!-- Add confirmation modals -->
    <ConfirmationModal
      :show="showSubmitConfirmation"
      title="Submit Exam"
      message="Are you sure you want to submit this exam? This action cannot be undone."
      confirmText="Submit"
      type="primary"
      @confirm="handleExamSubmission"
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
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';
import { useToast } from "vue-toastification";  // Import toast
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  name: 'ExamDetails',
  components: {
    Header,
    Sidebar,
    ConfirmationModal
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [],
      newComment: "",
      submissionText: "",
      externalLink: "",
      selectedFile: null,
      submissionType: "",
      currentExam: null,
      newComment: '',
      showSubmitConfirmation: false,
      showCommentConfirmation: false,
      pendingComment: ''
    };
  },
  methods: {
    async fetchData() {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.role === 'student') {
          this.student = {
            id: storedUser.user_id,
            name: storedUser.name
          };
        } else {
          console.error('No valid student data found');
          return;
        }

        const courseId = parseInt(this.$route.params.courseId);
        const examId = parseInt(this.$route.params.examId);

        const res = await axios.get(`http://127.0.0.1:8000/api/student_exams/${this.student.id}/${courseId}`);
        if (res.status === 200) {
          const exams = res.data.exams;
          this.currentExam = exams.find(exam => exam.exam_id === examId) || null;
        }
      } catch (error) {
        console.error('Error fetching exam data:', error);
      }
    },

    // Helper function to extract the file name from the URL
    getFileName(fileUrl) {
      return fileUrl.split('/').pop();
    },

    downloadFile(fileUrl) {
      const formattedUrl = fileUrl.replace(/\\/g, '/'); // In case the file path uses backslashes

      if (formattedUrl.startsWith('http')) {
        // Open the URL in a new tab
        window.open(formattedUrl, '_blank');
      } else {
        // Extract the file name and open the download link in a new tab
        const fileName = this.getFileName(formattedUrl);
        window.open(`http://127.0.0.1:8000/api/assignments/download/${fileName}`, '_blank');
      }
    },

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }) : 'N/A';
    },

    // Add confirmation methods for exam submission
    confirmSubmitExam() {
      this.showSubmitConfirmation = true;
    },

    async handleExamSubmission() {
      this.showSubmitConfirmation = false;
      try {
        // Add your exam submission logic here
        this.toast.success('Exam submitted successfully!');
      } catch (error) {
        console.error('Error submitting exam:', error);
        this.toast.error('Failed to submit exam. Please try again.');
      }
    },

    // Add confirmation methods for comments
    confirmAddComment() {
      if (!this.newComment.trim()) return;
      this.pendingComment = this.newComment;
      this.showCommentConfirmation = true;
    },

    async handleCommentSubmission() {
      this.showCommentConfirmation = false;
      try {
        const res = await axios.post(`http://127.0.0.1:8000/api/exam/${this.currentExam.exam_id}/comments`, {
          text: this.pendingComment,
          author: this.student.name
        });

        if (res.status === 201) {
          this.currentExam.comments.push({
            id: res.data.id,
            text: this.pendingComment,
            author: this.student.name,
            date: new Date().toISOString()
          });
          this.newComment = '';
          this.pendingComment = '';
          this.toast.success('Comment added successfully!');
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        this.toast.error('Failed to add comment. Please try again.');
      }
    },

    goBack() {
      this.$router.go(-1);
    }
  },
  async mounted() {
    await this.fetchData();
  }
};
</script>

<style scoped>
.exam-details-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.exam-detail {
    display: flex;
    flex: 1;
}

.exam-detail-container {
    flex: 1;
    padding: 1rem;
    max-width: 100%;
    margin: 0 auto;
    overflow-y: auto; /* This will enable vertical scrolling */
    max-height: 100%; /* Set a maximum height for the container */
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

.exam-content {
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

.exam-header {
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 8px;
}

.exam-header h1 {
    color: #333;
}

.exam-meta {
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
    background-color: #4CAF50;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
}

.send-btn:hover {
    background-color: #45a049;
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
</style>