<template>
  <div class="course-content-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      
      <div class="material-detail-container" v-if="currentMaterial">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="material-content">
          <div class="main-content">
            <div class="material-header">
              <h1>{{ currentMaterial.title }}</h1>
              <div class="material-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i> 
                  Posted: {{ formatDate(currentMaterial.created_at) }}
                </span>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <p>{{ currentMaterial.description }}</p>

              <div v-if="currentMaterial.file_path" class="attachments">
                <h3>Attachments</h3>
                <div class="attachment-item" @click="downloadAttachment(currentMaterial.file_path)">
                  <i class="pi pi-file"></i>
                  <span>{{ getFileName(currentMaterial.file_path) }}</span>
                  <i class="pi pi-download"></i>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section comments">
              <h2>Class Comments</h2>
              <div class="comment-input">
                <input type="text" v-model="newComment" placeholder="Add class comment..." @keyup.enter="addComment" />
                <button class="send-btn" @click="addComment">
                  <i class="pi pi-send"></i>
                </button>
              </div>
              <div class="comments-list">
                <div v-for="comment in currentMaterial.comments" :key="comment.id" class="comment">
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
import Header from '@/components/header.vue';
import Sidebar from '../Sidebar.vue';
import axios from 'axios';

export default {
  name: 'CourseMaterialDetail',
  components: {
    Header,
    Sidebar
  },
  props: ['courseId', 'materialId'],
  data() {
    return {
      student: JSON.parse(localStorage.getItem("user")),
      courses: [],
      currentMaterial: null,
      newComment: "",
    };
  },
  async created() {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'student') {
      this.studentId = storedUser.user_id;
      await this.fetchCourseMaterial();
    }
  },
  methods: {
    async fetchCourseMaterial() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/student_course_content/${this.studentId}/${this.courseId}`);
        if (response.data.content) {
          this.currentMaterial = response.data.content.find(material => material.content_id === parseInt(this.materialId)) || null;
        } else {
          this.currentMaterial = null;
        }
      } catch (error) {
        console.error("Error fetching course material:", error);
      }
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleDateString() : 'N/A';
    },
    downloadAttachment(filePath) {
      const formattedPath = filePath.replace(/\\/g, '/'); // Ensure proper path formatting
      window.open(`http://127.0.0.1:8000/${formattedPath}`, "_blank");
    },
    getFileName(filePath) {
      return filePath.split(/[\\/]/).pop(); // Handle both forward and backslashes
    },
    addComment() {
      if (!this.newComment.trim()) return;
      this.currentMaterial.comments = this.currentMaterial.comments || [];
      this.currentMaterial.comments.push({
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
.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.course-content {
  display: flex;
  flex: 1;
}

.material-detail-container {
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


.material-content {
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


.material-header {
  background-color: #D9D9D9;
  padding: 2rem;
  border-radius: 8px;
}

.material-header h1 {
  color: #333;
}

.material-meta {
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

.instruction-content {
  color: #666;
}

.upload-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 20px;
  font-size: 100%;
  font-weight: 800;
  background-color: #F5F5F5;
  color: rgba(0, 0, 0, 0.781);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px; /* Adjust this value to fit your design */
  overflow-y: auto; /* Enable vertical scrolling */
}

.comment-input {
  display: flex;
  gap: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.comment {
  display: flex;
  gap: 1rem;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.comment img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.status.not-submitted {
  background-color: #FF6B6B;
  color: white;
}

.status.pending {
  background-color: #FFDD57;
  color: black;
}

.status.upcoming {
  background-color: #4C9A2A;
  color: white;
}
</style>
