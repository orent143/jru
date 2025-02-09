<template>
    <div class="course-content-container">
      <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="course-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <div class="material-detail-container" v-if="currentMaterial">
          <button class="back-btn" @click="goBack">
            <i class="pi pi-arrow-left"></i> Back to Course
          </button>
  
          <div class="material-content">
            <div class="main-content">
              <div class="material-header">
                <div class="header-content">
                  <h1>{{ currentMaterial.title }}</h1>
                  <button class="edit-btn" @click="editMaterial">
                    <i class="pi pi-pencil"></i> Edit
                  </button>
                </div>
                <div class="material-meta">
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i> 
                    Posted: {{ formatDate(currentMaterial.datePosted) }}
                  </span>
                </div>
              </div>
  
              <div class="content-section uploaded-materials">
                <h2>Uploaded Materials</h2>
                <div class="materials-list">
                  <div v-for="file in currentMaterial.attachments" 
                       :key="file.id"
                       class="material-item"
                       @click="downloadAttachment(file)">
                    <i :class="getFileIcon(file.type)"></i>
                    <span>{{ file.name }}</span>
                    <i class="pi pi-download" v-if="file.type !== 'link'"></i>
                    <i class="pi pi-link" v-if="file.type === 'link'"></i>
                  </div>
                </div>
              </div>
            </div>
            <div class="messages-section">
              <h3>Messages</h3>
              <div v-for="message in currentMaterial.comments" :key="message.id" class="message-item">
                <div class="message-header">
                  <span class="sender">{{ message.sender }}</span>
                  <span class="timestamp">{{ formatDate(message.timestamp) }}</span>
                </div>
                <div class="message-content">{{ message.content }}</div>
              </div>
              <div class="message-input">
                <input v-model="newMessage" placeholder="Type a message..." />
                <button @click="sendMessage">Send</button>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <p>No material found.</p>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  import Header from '@/components/faculty/header.vue';
  import Sidebar from '@/components/faculty/SideBar.vue';
  import AddMaterialModal from './AddMaterialModal.vue';
  
  export default {
    name: 'FacultyCourseMaterial',
    components: {
      Header,
      Sidebar,
      AddMaterialModal
    },
    data() {
    return {
      teacher: { name: 'Professor Smith' },
      searchQuery: '',
      isSidebarCollapsed: false,
      newMessage: '',
      courses: [

          {
            id: 1,
            name: 'ITELECT4',
            sections: [{ id: 1, name: 'BSCS-3A' }],
            materials: [
              {
                id: 1,
                title: 'Introduction to Programming',
                description: 'Basic programming concepts and logic building',
                datePosted: '2024-02-01',
                dueDate: '2024-02-15',
                status: 'Not started',
                attachments: [{ id: 1, name: 'intro_programming.pdf', type: 'pdf' }],
                submittedFiles: [],
                comments: []
              },
              {
                id: 2,
                title: 'Data Types and Variables',
                description: 'Understanding primitive data types',
                datePosted: '2024-02-03',
                dueDate: '2024-02-17',
                status: 'Not submitted',
                attachments: [],
                submittedFiles: [],
                comments: []
              }
            ],
            
            students: [
              { id: 1, name: 'John Smith' },
              { id: 2, name: 'Alice Johnson' }
            ]
          },
          {
            id: 2,
            name: 'ITELECT4',
            sections: [{ id: 2, name: 'BSCS-3B' }],
            materials: [
              {
                id: 1,
                title: 'Introduction to Programming',
                description: 'Basic programming concepts and logic building',
                datePosted: '2024-02-01',
                dueDate: '2024-02-15',
                status: 'Not started',
                attachments: [{ id: 1, name: 'intro_programming.pdf', type: 'pdf' }],
                submittedFiles: [],
                comments: []
              },
              {
                id: 2,
                title: 'Data Types and Variables',
                description: 'Understanding primitive data types',
                datePosted: '2024-02-03',
                dueDate: '2024-02-17',
                status: 'Not submitted',
                attachments: [],
                submittedFiles: [],
                comments: []
              }
            ],
            
            students: [
              { id: 1, name: 'John Smith' },
              { id: 2, name: 'Alice Johnson' }
            ]
          }
        ]
      };
    },
    computed: {
    currentMaterial() {
      if (!this.course) return null;
      const materialId = parseInt(this.$route.params.materialId);
      return this.course.materials.find(m => m.id === materialId) || null;
    },
    course() {
      const courseId = parseInt(this.$route.params.courseId);
      return this.courses.find(c => c.id === courseId);
    }
  },
  methods: {
    goBack() {
      this.$router.push({
        name: 'FacultyCourseContent',
        params: { courseId: this.$route.params.courseId }
      });
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    getFileIcon(type) {
      const icons = {
        pdf: 'pi pi-file-pdf',
        docx: 'pi pi-file-word',
        video: 'pi pi-video',
        link: 'pi pi-link',
        default: 'pi pi-file'
      };
      return icons[type] || icons.default;
    },
    sendMessage() {
      if (this.newMessage.trim() !== '') {
        const newComment = {
          id: Date.now(), // Simple ID generation (replace with proper ID logic)
          sender: 'Professor Smith',
          content: this.newMessage,
          timestamp: new Date().toISOString()
        };
        this.currentMaterial.comments.push(newComment);
        this.newMessage = ''; // Clear input field
      }
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
    max-height: 100%; /* Set a maximum height for the container */
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
    position: relative;
  }
  
  .material-header h1 {
    color: #333;
  }
  
  .material-header .edit-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
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
  .messages-section {
  background-color: #D9D9D9;
  padding: 1.5rem;
  border-radius: 8px;
  max-height: 80vh;
  overflow-y: auto;
}

.messages-section h3 {
  font-size: 1.5rem;
  color: #333;
}

.message-item {
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
}

.message-content {
  margin-top: 0.5rem;
  color: #555;
}

.message-input {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.message-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #D9D9D9;
  border-radius: 4px;
}

.message-input button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.message-input button:hover {
  background-color: #45a049;
}
  </style>