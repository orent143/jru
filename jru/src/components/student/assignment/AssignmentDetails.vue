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
                <span v-if="currentAssignment.status" class="status" :class="currentAssignment.status.toLowerCase()">
                  {{ currentAssignment.status }}
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
                <div v-if="currentAssignment.file_path" class="attachment-item" @click="downloadAttachment(currentAssignment.file_path)">
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

              <!-- Submission Form -->
              <form @submit.prevent="submitAssignment" enctype="multipart/form-data">
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
                <input type="text" v-model="newComment" placeholder="Add class comment..." @keyup.enter="addComment" />
                <button class="send-btn" @click="addComment">
                  <i class="pi pi-send"></i>
                </button>
              </div>
              <div class="comments-list">
                <div v-for="comment in currentAssignment.comments" :key="comment.id" class="comment">
                  <img :src="comment.authorAvatar" :alt="comment.author" />
                  <div class="comment-content">
                    <h4>{{ comment.author }}</h4>
                    <span class="comment-date">{{ formatDate(comment.date) }}</span>
                    <p>{{ comment.text }}</p>
                  </div>
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
import Header from '../Header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';
import { useToast } from "vue-toastification";  

export default {
  name: 'AssignmentDetail',
  components: { Header, Sidebar },
  props: ['courseId', 'assignmentId'],
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      student: {},
      courses: [],
      currentAssignment: null,
      newComment: "",
      submissionText: "",
      externalLink: "",
      selectedFile: null,
      submissionType: "",
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchAssignmentDetail();
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

    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },

    handleFileChange(event) {
      this.selectedFile = event.target.files[0];
    },

    async submitAssignment() {
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
        await axios.post("http://127.0.0.1:8000/api/submit-assignment/", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        this.toast.success("✅ Assignment submitted successfully!");
        this.submissionText = "";
        this.externalLink = "";
        this.selectedFile = null;
        this.submissionType = "";

      } catch (error) {
        console.error("Error submitting assignment:", error);
        this.toast.error("❌ Failed to submit assignment. Please try again.");
      }
    },

    downloadAttachment(filePath) {
      const formattedPath = filePath.replace(/\\/g, '/').split('/').pop();
      window.open(`http://127.0.0.1:8000/api/assignments/download/${formattedPath}`, "_blank");
    },

    getFileName(filePath) {
      return filePath.split(/[\\/]/).pop();
    },

    addComment() {
      if (!this.newComment.trim()) return;
      this.currentAssignment.comments.push({
        id: Date.now(),
        author: "You",
        authorAvatar: "/default-avatar.png",
        text: this.newComment,
        date: new Date().toISOString(),
      });
      this.newComment = "";
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

.status.indicator {
  background-color: #f39c12;
}
</style>
