<template>
  <div class="course-content-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />

    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <main class="course-main">
        <div class="page-header">
          <div class="header-content">
            <h1>{{ courseName || "Loading..." }} - Course Content</h1>
            <p class="course-subtitle">Manage course materials and resources for your students.</p>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="openAddMaterialModal">
              <i class="pi pi-plus"></i>
              Add Material
            </button>
          </div>
        </div>

        <div class="content-grid">
          <div class="content-column-left">
            <section class="student-section">
              <div class="section-header">
                <h2>
                  <i class="pi pi-users section-icon"></i>
                  Students Enrolled
                </h2>
                <button class="view-all-btn" @click="viewStudents">View All</button>
              </div>
              <div class="section-content">
                <p>View and manage students enrolled in this course.</p>
              </div>
            </section>
            
            <section class="grades-section">
              <div class="section-header">
                <h2>
                  <i class="pi pi-chart-bar section-icon"></i>
                  Grades Management
                </h2>
                <button class="view-all-btn" @click="viewGrades">View Grades</button>
              </div>
              <div class="section-content">
                <p>Track and manage student grades and performance.</p>
              </div>
            </section>
          </div>

          <div class="content-column-right">
            <section class="course-materials">
              <div class="section-header">
                <h2>
                  <i class="pi pi-book section-icon"></i>
                  Course Materials
                </h2>
                <span class="last-updated">Last updated: {{ formattedDate }}</span>
              </div>

              <div v-if="loading" class="loading-container">
                <i class="pi pi-spin pi-spinner"></i>
                <p>Loading materials...</p>
              </div>

              <div v-else-if="courseContent.length === 0" class="empty-state">
                <i class="pi pi-folder"></i>
                <p>No materials available.</p>
              </div>

              <div v-else class="material-cards">
                <div v-for="(material, index) in courseContent"
                     :key="index"
                     class="material-card"
                     @click="viewMaterial(material)">
                  <div class="material-icon">
                    <i class="pi pi-file"></i>
                  </div>
                  <div class="material-info">
                    <h3>{{ material.title }}</h3>
                    <div class="material-meta">
                      <span class="material-type">Material</span>
                      <span class="material-date">{{ formatDate(material.upload_date) }}</span>
                    </div>
                    <p class="material-description">{{ truncateDescription(material.description) }}</p>
                  </div>
                  <div class="card-actions">
                    <i class="pi pi-trash delete-icon"
                       @click.stop="confirmDeleteMaterial(material.content_id)"></i>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <AddMaterialModal
      :courseId="courseId"
      v-if="showAddMaterialModal"
      @close="showAddMaterialModal = false"
      @add-material="addMaterial"
    />

    <ConfirmationModal
      :show="showDeleteConfirmation"
      title="Delete Material"
      message="Are you sure you want to delete this material?"
      confirmText="Delete"
      type="danger"
      @confirm="handleDeleteMaterial"
      @cancel="cancelDeleteMaterial"
    />
  </div>
</template>
<script>
import axios from "axios";
import Header from "@/components/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import AddMaterialModal from "@/components/faculty/Course/AddMaterialModal.vue";
import ConfirmationModal from "@/components/ConfirmationModal.vue";

export default {
  components: {
    Header,
    Sidebar,
    AddMaterialModal,
    ConfirmationModal
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      courseName: "",
      courseContent: [],
      loading: true,
      isSidebarCollapsed: false,
      showAddMaterialModal: false,
      showDeleteConfirmation: false,
      pendingDeleteMaterialId: null,
    };
  },
  computed: {
    formattedDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  mounted() {
    this.fetchCourseContent();
  },
  methods: {
    getUserRole() {
      const user = JSON.parse(localStorage.getItem('user'));
      return user ? user.role : null;
    },
    async fetchCourseContent() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course_materials/${this.courseId}`);
        this.courseName = response.data.course_name;
        this.courseContent = response.data.materials;
        this.loading = false;
      } catch (error) {
        console.error("Error fetching course content:", error);
        this.loading = false;
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    openAddMaterialModal() {
      this.showAddMaterialModal = true;
    },
    addMaterial(newMaterial) {
      this.courseContent.push(newMaterial);
    },
    formatDate(dateString) {
      if (!dateString) return "Date not available";
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    truncateDescription(description) {
      if (!description) return "";
      return description.length > 60 ? description.substring(0, 60) + "..." : description;
    },
    viewMaterial(material) {
      if (!material || !material.content_id) {
        console.error("Material ID missing");
        return;
      }

      const role = this.getUserRole();
      const routeName = role === 'faculty' ? 'FacultyMaterialDetail' : 'StudentMaterialDetail';

      this.$router.push({
        name: routeName,
        params: { courseId: this.courseId, materialId: material.content_id },
      });
    },
    viewStudents() {
      this.$router.push({ name: "StudentList", params: { courseId: this.courseId } });
    },
    viewGrades() {
      this.$router.push({ name: "GradeCreation", params: { courseId: this.courseId } });
    },
    confirmDeleteMaterial(materialId) {
      this.pendingDeleteMaterialId = materialId;
      this.showDeleteConfirmation = true;
    },
    async handleDeleteMaterial() {
      try {
        await axios.delete(`http://127.0.0.1:8000/api/course-content/${this.pendingDeleteMaterialId}`);
        this.courseContent = this.courseContent.filter(
          material => material.content_id !== this.pendingDeleteMaterialId
        );
      } catch (error) {
        console.error("Error deleting material:", error);
      } finally {
        this.showDeleteConfirmation = false;
        this.pendingDeleteMaterialId = null;
      }
    },
    cancelDeleteMaterial() {
      this.showDeleteConfirmation = false;
      this.pendingDeleteMaterialId = null;
    }
  }
};
</script>


<style scoped>
.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.course-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background-color: #f8f9fa;
  overflow-y: auto;
  max-height: calc(100vh - 64px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 1.5rem;
}

.header-content h1 {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.course-subtitle {
  font-size: 1rem;
  color: #6c757d;
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  background-color: #007BF6;
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #0069d9;
}

.content-grid {
  display: flex;
  flex-direction: row;
  gap: 2rem;
}

.content-column-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 30%;
}

.content-column-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 70%;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
}

.section-header h2 {
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-icon {
  color: #007BF6;
}

.last-updated {
  font-size: 0.85rem;
  color: #6c757d;
}

.view-all-btn {
  background: none;
  border: none;
  color: #007BF6;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s;
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
}

.view-all-btn:hover {
  color: #0056b3;
  background-color: rgba(0, 123, 246, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
}

.loading-container i {
  font-size: 2.5rem;
  color: #007BF6;
  margin-bottom: 1rem;
}

.loading-container p {
  color: #6c757d;
  margin: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  color: #adb5bd;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6c757d;
  margin: 0;
}

/* Course Materials */
.course-materials {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow-y: auto;
}

.material-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.material-card {
  display: flex;
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  position: relative;
  border-left: 4px solid #007BF6;
}

.material-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f0f4f9;
}

.material-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #e6f2ff;
  color: #007BF6;
  border-radius: 8px;
  margin-right: 1rem;
  flex-shrink: 0;
}

.material-icon i {
  font-size: 1.2rem;
}

.material-info {
  flex: 1;
  overflow: hidden;
}

.material-info h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.material-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.material-type,
.material-date {
  font-size: 0.8rem;
  color: #6c757d;
}

.material-type {
  background-color: #e9ecef;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
}

.material-description {
  font-size: 0.85rem;
  color: #495057;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  align-items: center;
}

.delete-icon {
  font-size: 1rem;
  color: #dc3545;
  padding: 0.5rem;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.delete-icon:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Student and Grades Sections */
.student-section,
.grades-section {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.section-content {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007BF6;
}

.section-content p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

@media (max-width: 1200px) {
  .content-grid {
    flex-direction: column;
  }
  
  .content-column-left,
  .content-column-right {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
  }
}
</style>