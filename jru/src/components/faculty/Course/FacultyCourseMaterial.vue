<template>
  <div class="course-content-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" />

      <div class="material-detail-container">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="material-content">
          <div class="main-content">
            <div class="course-header">
              <div class="header-content">
                <h1>Material Title: {{ material?.title || "Loading..." }}</h1>
                <button class="edit-btn" @click="openEditModal">
                  <i class="pi pi-pencil"></i> Edit
                </button>
              </div>
              <div class="course-meta">
                <span class="posted-date">
                  <i class="pi pi-calendar"></i>
                  Posted at: {{ formatDate(material?.posted_at) }}
                </span>
              </div>
            </div>

            <div class="content-section">
              <h2>Content description:</h2>
              <p>{{ material?.content || "No content available" }}</p>
            </div>

            <div v-if="material?.file_path" class="uploaded-materials">
              <h2>Attachments:</h2>
              <div class="material-item" @click="downloadAttachment(material.file_path)">
                <i class="pi pi-file"></i>
                <span class="file-name">{{ getFileName(material.file_path) }}</span>
                <i class="pi pi-download"></i>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="messages-section">
              <h2>Discussion</h2>
              <div v-if="messages.length">
                <div v-for="msg in messages" :key="msg.id" class="message-item">
                  <p><strong>{{ msg.user }}:</strong> {{ msg.text }}</p>
                </div>
              </div>
              <div v-else>
                <p>No messages yet.</p>
              </div>

              <div class="message-input">
                <input v-model="newMessage" placeholder="Type a message..." />
                <button @click="sendMessage">Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <EditMaterialModal
      v-if="showEditModal"
      :courseId="courseId"
      :material="selectedMaterial"
      @update-material="handleMaterialUpdate"
      @close="showEditModal = false"
    />
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import EditMaterialModal from './EditMaterialModal.vue';

export default {
  components: {
    Header,
    Sidebar,
    EditMaterialModal
  },
  props: ["courseId", "materialId"],
  data() {
    return {
      material: null,
      loading: true,
      messages: [],
      newMessage: "",
      showEditModal: false,
      selectedMaterial: null,
    };
  },
  methods: {
    openEditModal() {
      this.selectedMaterial = this.material;
      this.showEditModal = true;
    },
    handleMaterialUpdate(updatedMaterial) {
      this.material = updatedMaterial;
      this.showEditModal = false;
    },
    async fetchMaterialDetails() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course_materials/${this.courseId}`);
        const materials = response.data.materials;
        this.material = materials.find(m => m.content_id == this.materialId);

        if (!this.material) {
          console.error("Material not found.");
        }

        this.loading = false;
      } catch (error) {
        console.error("Error fetching material details:", error);
        this.loading = false;
      }
    },
    goBack() {
      this.$router.push({ 
        name: "FacultyCourseContent", 
        params: { courseId: this.courseId } 
      });
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({ id: Date.now(), user: "You", text: this.newMessage });
        this.newMessage = "";
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', options);
    },
    downloadAttachment(filePath) {
      if (!filePath) return;

      const cleanPath = filePath.replace(/\\/g, '/');
      const fileName = this.getFileName(cleanPath);

      if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
        // External link - open in new tab
        const link = document.createElement("a");
        link.href = cleanPath;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Local file - download from backend
        const downloadUrl = `http://127.0.0.1:8000/api/course-content/download/${encodeURIComponent(fileName)}`;
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.setAttribute("download", fileName);
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    getFileName(filePath) {
      return filePath.split(/[\\/]/).pop();
    }
  },
  mounted() {
    this.fetchMaterialDetails();
  }
};
</script>


<style scoped>
.posted-at {
  font-size: 1rem;
  color: #718096;
  margin-top: 0.5rem;
}

.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; 
  font-family: 'Roboto', sans-serif;
}

.course-content {
  display: flex;
  flex: 1;
  overflow: hidden; 
  background-color: #f5f7fa;
}

.material-detail-container {
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

.material-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  padding-bottom: 2rem; 
}

.main-content {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.course-header {
  background-color: #ffffff;
  padding: 2rem;
  position: relative;
  border-bottom: 1px solid #edf2f7;
}

.header-content h1 {
  color: #1a202c;
  font-weight: 700;
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.edit-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: #4299e1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #ebf8ff;
}

.course-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: #718096;
}

.course-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.side-content {
  flex: 1;
}

.title-section {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.title-section h1 {
  color: #1a202c;
  font-weight: 700;
}

.content-section {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  min-height: 300px;
  color: #212121;
}

.content-section h2 {
  font-size: 1.25rem;
  color: #2d3748;
  font-weight: 600;
  margin-bottom: 1.25rem;
}

.content-section p {
  margin-bottom: 1.5rem;
  font-size: 1.1rem;
  color: #4a5568;
  line-height: 1.6;
}

.uploaded-materials {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 8px;
  min-height: 300px;
  color: #212121;
}

.material-item {
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

.material-item:hover {
  background-color: #edf2f7;
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.uploaded-materials .material-item i {
  font-size: 1.25rem;
  color: #4a5568;
}

.uploaded-materials h2 {
  font-size: 1.25rem;
  color: #2d3748;
  margin-bottom: 1.25rem;
  font-weight: 600;
}

.file-link {
  color: #3182ce;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.messages-section {
  background-color: #ffffff;
  padding: 1.5rem;
  border-radius: 12px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.messages-section h2,
.messages-section p {
  color: #2d3748;
}

.messages-section h2 {
  font-weight: 600;
  margin-bottom: 1.25rem;
  font-size: 1.25rem;
}

.message-item {
  background-color: #f9fafb;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border: 1px solid #edf2f7;
  transition: all 0.2s ease;
}

.message-item:hover {
  background-color: #edf2f7;
  transform: translateX(2px);
}

.message-input {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.message-input input {
  flex: 1;
  padding: 0.85rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background-color: #f9fafb;
  transition: all 0.2s ease;
}

.message-input input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15);
  background-color: white;
}

.message-input button {
  padding: 0.75rem 1.5rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.message-input button:hover {
  background-color: #3182ce;
  transform: translateY(-1px);
}
</style>
