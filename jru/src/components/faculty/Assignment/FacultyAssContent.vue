<template>
  <div class="course-content-container">
    <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
        <div class="page-header">
          <div class="header-content">
            <h1>{{ course.name }} - Assignments</h1>
            <p class="course-subtitle">Create and manage assignments to support student learning and track progress.</p>
          </div>
          <div class="header-actions">
            <button class="action-btn" @click="showAddAssignmentModal = true">
              <i class="pi pi-plus"></i>
              Create Assignment
            </button>
          </div>
        </div>

        <div class="content-grid">
          <div class="content-column-left">
            <section class="assignments-summary">
              <div class="section-header">
                <h2>
                  <i class="pi pi-calendar section-icon"></i>
                  Due Soon
                </h2>
                <span class="last-updated">Last updated: {{ formattedDate }}</span>
              </div>
              <div v-if="upcomingAssignments.length === 0" class="empty-state">
                <i class="pi pi-info-circle"></i>
                <p>No upcoming assignments</p>
              </div>
              <ul v-else class="assignment-list">
                <li v-for="assignment in upcomingAssignments" :key="assignment.assignment_id" class="assignment-item">
                  <h3>{{ assignment.title }}</h3>
                  <p>Due: {{ formatDate(assignment.due_date) }}</p>
                </li>
              </ul>
            </section>
          </div>

          <div class="content-column-right">
            <section class="assignments">
              <div class="section-header">
                <h2>
                  <i class="pi pi-file-edit section-icon"></i>
                  All Assignments
                </h2>
              </div>
              <div v-if="assignments.length === 0" class="empty-state">
                <i class="pi pi-folder"></i>
                <p>No assignments available</p>
              </div>
              <div v-else class="material-cards">
                <div 
                  v-for="assignment in assignments" 
                  :key="assignment.assignment_id" 
                  class="material-card" 
                  @click="navigateToAssignment(assignment)"
                >
                  <div class="material-icon">
                    <i class="pi pi-file-edit"></i>
                  </div>
                  <div class="material-info">
                    <h3>{{ assignment.title }}</h3>
                    <div class="material-meta">
                      <span class="material-type">Assignment</span>
                      <span class="material-date">{{ formatDate(assignment.due_date) }}</span>
                    </div>
                  </div>
                  <div class="card-actions">
                    <i class="pi pi-trash delete-icon" @click.stop="confirmDeleteAssignment(assignment.assignment_id)"></i>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>

    <AddAssignmentModal 
        v-if="showAddAssignmentModal" 
        @close="showAddAssignmentModal = false" 
        @add-assignment="addAssignment"
        :courseId="courseId" 
    />

    <ConfirmationModal
    :show="showDeleteConfirmation"
    title="Delete Assignment"
    :message="'Are you sure you want to delete this assignment?'"
    confirmText="Delete"
    type="danger"
    @confirm="handleDeleteAssignment"
    @cancel="cancelDeleteAssignment"
    />
  </div>
</template>

<script>
import axios from 'axios';
import Header from "@/components/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import AddAssignmentModal from "@/components/faculty/Assignment/AddAssignmentModal.vue";
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  name: 'FacultyAssignmentContent',
  components: {
    Header,
    Sidebar,
    AddAssignmentModal,
    ConfirmationModal
  },
  data() {
    return {
      course: null,
      assignments: [],
      courses: [],
      showAddAssignmentModal: false,
      teacher: {},
      searchQuery: '',
      isSidebarCollapsed: false,
      showDeleteConfirmation: false,
      pendingDeleteAssignmentId: null
    };
  },
  props: {
    courseId: {
      type: Number,
      required: true
    }
  },
  computed: {
    upcomingAssignments() {
      return this.assignments.filter(assignment => 
        assignment.due_date && new Date(assignment.due_date) > new Date()
      ).sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    },
    formattedDate() {
      return new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  },
  methods: {
    async fetchAssignments() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/assignments/assignments/${this.courseId}`);

        this.course = {
          name: response.data.course_name, 
          sections: [],
        };

        this.assignments = response.data.assignments.map(assignment => ({
          assignment_id: assignment.assignment_id,
          title: assignment.title,
          description: assignment.description,
          due_date: assignment.due_date,
          file_path: assignment.file_path,
          instructor_name: assignment.instructor_name
        }));
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    },
    navigateToAssignment(assignment) {
      this.$router.push({ 
        name: 'FacultyAssignmentDetails', 
        params: { assignmentId: assignment.assignment_id }
      });
    },
    addAssignment(newAssignment) {
      this.assignments.push(newAssignment);
    },
    formatDate(dateString) {
      if (!dateString) return "No due date";
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
    confirmDeleteAssignment(assignmentId) {
      this.pendingDeleteAssignmentId = assignmentId;
      this.showDeleteConfirmation = true;
    },
    async handleDeleteAssignment() {
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/assignments/${this.pendingDeleteAssignmentId}`);
        this.assignments = this.assignments.filter(assignment => assignment.assignment_id !== this.pendingDeleteAssignmentId);
        this.showDeleteConfirmation = false;
        this.pendingDeleteAssignmentId = null;
        console.log(response.data.message);
      } catch (error) {
        console.error("Error deleting assignment:", error);
        this.showDeleteConfirmation = false;
        this.pendingDeleteAssignmentId = null;
      }
    },
    cancelDeleteAssignment() {
      this.showDeleteConfirmation = false;
      this.pendingDeleteAssignmentId = null;
    }
  },
  mounted() {
    this.fetchAssignments();
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

/* Assignments Summary */
.assignments-summary {
  background-color: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  max-height: 250px;
  overflow-y: auto;
}

.assignment-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.assignment-item {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007BF6;
}

.assignment-item h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.assignment-item p {
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
}

/* Assignments Section */
.assignments {
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