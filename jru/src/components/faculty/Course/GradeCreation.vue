<template>
  <div class="view-grades-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="container">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      
      <div class="content">
        <div class="grade-creation-container">
          <div class="grade-creation-header">
            <h2>Grade Management</h2>
            <button class="add-grade-btn" @click="openAddGradeModal">
              <i class="pi pi-plus"></i> Add Grade
            </button>
          </div>

          <div v-if="loading" class="loading-message">
            <i class="pi pi-spin pi-spinner"></i>
            <p>Loading grades...</p>
          </div>

          <div v-else-if="grades.length === 0" class="no-grades-message">
            <i class="pi pi-info-circle"></i>
            <p>No grades have been assigned yet.</p>
            <button class="add-first-grade-btn" @click="openAddGradeModal">Add Your First Grade</button>
          </div>

          <div v-else class="grades-table-container">
            <table class="grades-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>School Year</th>
                  <th>Semester</th>
                  <th>Prelim</th>
                  <th>Midterm</th>
                  <th>Finals</th>
                  <th>Final Grade</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="grade in grades" :key="grade.grade_id">
                  <td>{{ grade.student_id }}</td>
                  <td>{{ grade.student_name }}</td>
                  <td>{{ grade.school_year }}</td>
                  <td>{{ grade.semester }}</td>
                  <td :class="getGradeClass(grade.prelim_grade)">{{ grade.prelim_grade }}</td>
                  <td :class="getGradeClass(grade.midterm_grade)">{{ grade.midterm_grade }}</td>
                  <td :class="getGradeClass(grade.finals_grade)">{{ grade.finals_grade }}</td>
                  <td :class="getGradeClass(grade.overall_grade)">{{ grade.overall_grade }}</td>
                  <td class="action-buttons">
                    <button @click="editGrade(grade)" class="edit-btn" title="Edit Grade">
                      <i class="pi pi-pencil"></i>
                    </button>
                    <button @click="confirmDeleteGrade(grade.grade_id)" class="delete-btn" title="Delete Grade">
                      <i class="pi pi-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="showGradeModal" class="modal">
            <div class="modal-content">
              <span class="close" @click="closeGradeModal">&times;</span>
              <h2>{{ isEditing ? 'Edit Grade' : 'Add Grade' }}</h2>
              
              <div class="form-group">
                <label for="student_id">Student ID</label>
                <input 
                  v-model="gradeForm.student_id" 
                  type="number" 
                  id="student_id" 
                  placeholder="Enter Student ID"
                  :disabled="isEditing"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="prelim_grade">Prelim Grade</label>
                <input 
                  v-model="gradeForm.prelim_grade" 
                  type="number" 
                  id="prelim_grade" 
                  placeholder="Enter Prelim Grade (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="midterm_grade">Midterm Grade</label>
                <input 
                  v-model="gradeForm.midterm_grade" 
                  type="number" 
                  id="midterm_grade" 
                  placeholder="Enter Midterm Grade (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="finals_grade">Finals Grade</label>
                <input 
                  v-model="gradeForm.finals_grade" 
                  type="number" 
                  id="finals_grade" 
                  placeholder="Enter Finals Grade (0-100)"
                  min="0"
                  max="100"
                  step="0.1"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="school_year">School Year</label>
                <input 
                  v-model="gradeForm.school_year" 
                  type="text" 
                  id="school_year" 
                  placeholder="Enter School Year"
                  :disabled="isEditing"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label for="semester">Semester</label>
                <select 
                  v-model="gradeForm.semester" 
                  id="semester" 
                  :disabled="isEditing"
                  class="form-control"
                >
                  <option v-for="option in semesterOptions" :key="option" :value="option">
                    {{ option }} Semester
                  </option>
                </select>
              </div>

              <button 
                class="submit-btn" 
                @click="submitGrade" 
                :disabled="isSubmitting || !isFormValid"
              >
                {{ isEditing ? 'Update Grade' : 'Add Grade' }}
              </button>
            </div>
          </div>

          <ConfirmationModal
            :show="showDeleteConfirmation"
            title="Delete Grade"
            message="Are you sure you want to delete this grade? This action cannot be undone."
            confirmText="Delete"
            type="danger"
            @confirm="handleDeleteGrade"
            @cancel="showDeleteConfirmation = false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";
import { useToast } from 'vue-toastification';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  components: {
    Header,
    Sidebar,
    ConfirmationModal
  },
  props: {
    courseId: {
      type: [String, Number],
      required: true
    },
    courses: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      grades: [],
      loading: true,
      showGradeModal: false,
      showDeleteConfirmation: false,
      isSubmitting: false,
      isEditing: false,
      gradeToDelete: null,
      gradeForm: {
        student_id: null,
        course_id: null,
        prelim_grade: null,
        midterm_grade: null,
        finals_grade: null,
        school_year: this.getCurrentSchoolYear(),
        semester: '1st',
      },
      semesterOptions: ['1st', '2nd'],
      searchQuery: "",
      isSidebarCollapsed: false,
    };
  },
  computed: {
    isFormValid() {
      return this.gradeForm.student_id && 
             (this.gradeForm.prelim_grade !== null || 
              this.gradeForm.midterm_grade !== null || 
              this.gradeForm.finals_grade !== null);
    }
  },
  mounted() {
    this.fetchGrades();
  },
  methods: {
    getCurrentSchoolYear() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; 
      const startYear = month < 7 ? year - 1 : year;
      const endYear = month < 7 ? year : year + 1;
      return `${startYear}-${endYear}`;
    },
    async fetchGrades() {
      this.loading = true;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/courses/${this.courseId}/grades`);
        this.grades = response.data;
      } catch (error) {
        console.error("Error fetching grades:", error);
        const toast = useToast();
        toast.error("Failed to load grades");
      } finally {
        this.loading = false;
      }
    },
    openAddGradeModal() {
      this.isEditing = false;
      this.gradeForm = {
        student_id: null,
        course_id: this.courseId,
        prelim_grade: null,
        midterm_grade: null,
        finals_grade: null,
        school_year: this.getCurrentSchoolYear(),
        semester: '1st',
      };
      this.showGradeModal = true;
    },
    editGrade(grade) {
      this.isEditing = true;
      this.gradeForm = {
        student_id: grade.student_id,
        course_id: this.courseId,
        prelim_grade: grade.prelim_grade,
        midterm_grade: grade.midterm_grade,
        finals_grade: grade.finals_grade,
        school_year: grade.school_year || this.getCurrentSchoolYear(),
        semester: grade.semester || '1st',
      };
      this.showGradeModal = true;
    },
    closeGradeModal() {
      this.showGradeModal = false;
      this.gradeForm = {
        student_id: null,
        course_id: null,
        prelim_grade: null,
        midterm_grade: null,
        finals_grade: null,
        school_year: this.getCurrentSchoolYear(),
        semester: '1st',
      };
    },
    async submitGrade() {
      const toast = useToast();
      
      if (!this.isFormValid) {
        toast.error("Please provide at least one grade");
        return;
      }
      
      if ((this.gradeForm.prelim_grade !== null && (this.gradeForm.prelim_grade < 0 || this.gradeForm.prelim_grade > 100)) ||
          (this.gradeForm.midterm_grade !== null && (this.gradeForm.midterm_grade < 0 || this.gradeForm.midterm_grade > 100)) ||
          (this.gradeForm.finals_grade !== null && (this.gradeForm.finals_grade < 0 || this.gradeForm.finals_grade > 100))) {
        toast.error("Grades must be between 0 and 100");
        return;
      }
      
      this.isSubmitting = true;
      try {
        if (this.isEditing) {
          await axios.put(
            `http://127.0.0.1:8000/api/grades/${this.gradeForm.student_id}/${this.courseId}`,
            {
              prelim_grade: this.gradeForm.prelim_grade,
              midterm_grade: this.gradeForm.midterm_grade,
              finals_grade: this.gradeForm.finals_grade,
              school_year: this.gradeForm.school_year,
              semester: this.gradeForm.semester
            }
          );
          toast.success("Grade updated successfully");
        } else {
          await axios.post("http://127.0.0.1:8000/api/grades/", this.gradeForm);
          toast.success("Grade added successfully");
        }
        
        await this.fetchGrades();
        this.closeGradeModal();
      } catch (error) {
        console.error("Error submitting grade:", error);
        const errorMessage = error.response?.data?.detail || "Failed to save grade";
        toast.error(errorMessage);
      } finally {
        this.isSubmitting = false;
      }
    },
    getGradeClass(grade) {
      if (grade === null) return "";
      if (grade >= 90) return 'grade-excellent';
      if (grade >= 80) return 'grade-good';
      if (grade >= 75) return 'grade-fair';
      if (grade >= 70) return 'grade-poor';
      return 'grade-failing';
    },
    confirmDeleteGrade(gradeId) {
      this.gradeToDelete = gradeId;
      this.showDeleteConfirmation = true;
    },
    async handleDeleteGrade() {
      const toast = useToast();
      
      try {
        await axios.delete(`http://127.0.0.1:8000/api/grades/${this.gradeToDelete}`);
        await this.fetchGrades();
        toast.success("Grade deleted successfully");
      } catch (error) {
        console.error("Error deleting grade:", error);
        const errorMessage = error.response?.data?.detail || "Failed to delete grade";
        toast.error(errorMessage);
      } finally {
        this.showDeleteConfirmation = false;
        this.gradeToDelete = null;
      }
    },
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  margin: 0 auto;
  overflow-x: auto;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: #fff;
}

.grade-creation-container {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.grade-creation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.grade-creation-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.add-grade-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.add-grade-btn:hover {
  background-color: #1a252f;
}

.loading-message, .no-grades-message {
  text-align: center;
  padding: 3rem;
  color: #666;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-message i, .no-grades-message i {
  font-size: 2rem;
  color: #2c3e50;
}

.add-first-grade-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s ease;
}

.add-first-grade-btn:hover {
  background-color: #1a252f;
}

.grades-table-container {
  overflow-x: auto;
  margin-top: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.grades-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
}

.grades-table th {
  background-color: #e0e0e0;
  color: #333;
  font-weight: 600;
  padding: 1rem;
  text-align: left;
}

.grades-table td {
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  color: #495057;
}

.grades-table tr:hover {
  background-color: #f8f9fa;
}

.grade-excellent { color: #28a745; font-weight: 600; }
.grade-good { color: #17a2b8; font-weight: 600; }
.grade-fair { color: #ffc107; font-weight: 600; }
.grade-poor { color: #fd7e14; font-weight: 600; }
.grade-failing { color: #dc3545; font-weight: 600; }

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s ease;
}

.edit-btn {
  color: #2c3e50;
}

.edit-btn:hover {
  background-color: #e9ecef;
}

.delete-btn {
  color: #dc3545;
}

.delete-btn:hover {
  background-color: #fff5f5;
}

/* Modal Styles - Updated to match AddAssignmentModal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  position: relative;
}

.modal-content h2 {
  font-size: 25px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000;
  font-size: 25px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.form-control:disabled {
  background-color: #e9ecef;
  cursor: not-allowed;
}

.submit-btn {
  padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  display: flex;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background-color: #004285;
}

.submit-btn:disabled {
  background-color: #a8d5ae;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .grade-creation-container {
    padding: 1rem;
  }

  .modal-content {
    width: 95%;
    margin: 1rem;
  }

  .grades-table th,
  .grades-table td {
    padding: 0.75rem;
  }
}
</style> 