<template>
  <div class="course-content-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" />

      <!-- ✅ Material Details -->
      <div class="material-detail-container">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="material-content">
          <div class="main-content">
            <div class="title-section">
              <h1>{{ material?.title || "Loading..." }}</h1>
            </div>
            <div class="content-section">
              <p>{{ material?.content || "No content available" }}</p>
            </div>


            <!-- ✅ Display File Link -->
            <div v-if="material?.file_path" class="uploaded-materials">
              <div class="material-item">
                <i class="pi pi-file"></i>
                <a
                  :href="`http://127.0.0.1:8000/${material.file_path}`"
                  target="_blank"
                  class="file-link"
                >
                  View Attached File
                </a>
              </div>
            </div>
          </div>

          <div class="side-content">
            <!-- ✅ Messages Section (For Future Chat Feature) -->
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
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/faculty/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";

export default {
  components: {
    Header,
    Sidebar
  },
  props: ["courseId", "materialId"],
  data() {
    return {
      material: null,
      loading: true,
      messages: [],
      newMessage: "",
    };
  },
  methods: {
    async fetchMaterialDetails() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course_materials/${this.courseId}`);
        const materials = response.data.materials;

        // ✅ Find the correct material based on materialId
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
      this.$router.push({ name: "CourseContent", params: { courseId: this.courseId } });
    },
    sendMessage() {
      if (this.newMessage.trim()) {
        this.messages.push({ id: Date.now(), user: "You", text: this.newMessage });
        this.newMessage = "";
      }
    }
  },
  mounted() {
    this.fetchMaterialDetails();
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
  display: grid
;
    grid-template-columns: 3fr 1fr;
    gap: 2rem;
    height: 100%;
    margin-bottom: 5rem;
}

.main-content {
  display: flex
;
    flex-direction: column;
    gap: 2rem;

}

.side-content {
  flex: 1;
}

.title-section {
  background-color: #D9D9D9;
  padding: 1.5rem;
  border-radius: 8px;
}
.title-section h1{
  color: #333;
}

.content-section {
  background-color: #D9D9D9;
    padding: 1.5rem;
    border-radius: 8px;
    min-height: 300px;
    color: #212121;

}
.content-section p {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
  color: #333;

}

.uploaded-materials .material-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.uploaded-materials .material-item i {
  font-size: 1.2rem;
}

.file-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.file-link:hover {
  text-decoration: underline;
}

.messages-section {
  background-color: #D9D9D9;
  padding: 1.5rem;
  border-radius: 8px;
  max-height: 80vh;
  overflow-y: auto;
}
.messages-section h2, .messages-section p{
  color: #333;

}
.message-item {
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.message-input {
  display: flex;
  gap: 1rem;
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
