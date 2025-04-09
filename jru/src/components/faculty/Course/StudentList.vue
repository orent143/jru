<template>
  <div class="course-content-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="container">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      
      <div class="content">
        <div class="student-list-content">
          <div class="student-header">
            <h1>Students List</h1>
            <button class="add-student-btn" @click="showEnrollModal = true">Enroll Student</button>
          </div>

          <div class="student-details">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Name</th>
                  <th>Student Email</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="student in students" :key="student.student_id">
                  <td>{{ student.student_id }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.email }}</td>
                  <td>N/A</td>
                  <td><span class="status">Enrolled</span></td>
                  <td>
                    <button class="delete-btn" @click="deleteStudent(student.student_id)">Delete</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Enrollment Modal -->
        <div v-if="showEnrollModal" class="modal">
          <div class="modal-content">
            <span class="close" @click="showEnrollModal = false">&times;</span>
            <h2>Enroll Student</h2>
            <label for="user">Select Student:</label>
            <select v-model="selectedUserId">
              <option v-for="user in allUsers" :key="user.user_id" :value="user.user_id">
                {{ user.name }} ({{ user.email }})
              </option>
            </select>
            <button @click="enrollStudent">Confirm</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import Header from "@/components/header.vue";
import Sidebar from "@/components/faculty/SideBar.vue";

export default {
  components: {
    Header,
    Sidebar,
  },
  props: {
    courses: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      students: [],
      allUsers: [],
      selectedUserId: null,
      showEnrollModal: false,
      searchQuery: "",
      isSidebarCollapsed: false,
    };
  },
  methods: {
    async fetchStudents() {
      const courseId = this.$route.params.courseId;
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/course_students/${courseId}`);
        console.log("Course students response:", response.data);
        
        // Check if the response has the expected structure
        if (response.data && response.data.students) {
          this.students = response.data.students;
          console.log("Processed students:", this.students);
        } else {
          console.error("Unexpected response format:", response.data);
          this.students = []; // Reset to empty array if format is unexpected
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        this.students = []; // Reset to empty array on error
      }
    },

    async fetchUsers() {
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/students/`);
        this.allUsers = response.data;
        console.log("Fetched users:", this.allUsers); // Add logging to debug
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    },

    // Method to enroll student
    async enrollStudent() {
      if (!this.selectedUserId) return;
      const courseId = this.$route.params.courseId;

      const payload = {
        user_id: this.selectedUserId,
        course_id: courseId
      };
      
      console.log("Enrolling student with payload:", payload); // Add logging

      try {
        const response = await axios.post("http://127.0.0.1:8000/api/student_courses/", payload);
        console.log("Enrollment response:", response.data); // Add logging
        if (response.status === 200) {
          alert(response.data.message);
          this.fetchStudents(); // Refresh student list after enrollment
          this.showEnrollModal = false; // Close the modal
        }
      } catch (error) {
        console.error("Error enrolling student:", error);
        if (error.response && error.response.data.detail) {
          alert(error.response.data.detail); // Show error message if any
        }
      }
    },

    // Method to delete student
    async deleteStudent(studentId) {
      if (!studentId) {
        console.error("No student ID provided for deletion");
        return;
      }
      
      const courseId = this.$route.params.courseId;
      console.log(`Removing student ${studentId} from course ${courseId}`);
      
      try {
        const response = await axios.delete(`http://127.0.0.1:8000/api/student_courses/${studentId}/${courseId}`);
        console.log("Remove response:", response.data);
        
        // Show success message
        if (response.data && response.data.message) {
          alert(response.data.message);
        }
        
        // Refresh the student list after successful removal
        await this.fetchStudents();
      } catch (error) {
        console.error("Error removing student from course:", error);
        if (error.response && error.response.data.detail) {
          alert(error.response.data.detail);
        }
      }
    },

    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
  },

  mounted() {
    this.fetchStudents();
    this.fetchUsers();
  },
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

.student-list-content {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  max-height: calc(100vh - 100px);
}

.student-header {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.student-details  {
  overflow-x: auto;
  margin-top: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.student-details table {
  width: 100%;
  border-collapse: collapse;
  overflow-x: auto;
  table-layout: auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-details th, 
.student-details td {
  padding: 12px;
  text-align: left;
  color: #333;
  border-bottom: 1px solid #ddd;
}

.student-details th {
  background-color: #e0e0e0;
  font-weight: bold;
}

h1 {
  font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.add-student-btn {
  background-color: #2c3e50;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.add-student-btn:hover {
  background-color: #1a252f;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.status.Active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status.Inactive {
  background-color: #fdeaec;
  color: #dc3545;
}

.edit-btn, 
.delete-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 4px;
  margin-right: 0.5rem;
  cursor: pointer;
}

.edit-btn {
  background-color: #4CAF50;
  color: white;
}

.edit-btn:hover {
  background-color: #45a049;
}

.delete-btn {
  background-color: #f44336;
  color: white;
}

.delete-btn:hover {
  background-color: #da190b;
}

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
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  color: #000000;
  width: 400px;
  position: relative;
}

.modal-content h2 {
  font-size: 25px;
  font-weight: 1000;
  color: #000000;
  padding-right: 30px;
  margin-bottom: 20px;
}

.modal-content label {
  display: block;
  margin-bottom: 10px;
  font-weight: bold;
}

.modal-content select {
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
}

.modal-content button {
  padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  margin-top: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  display: flex;
  justify-content: center;
}

.modal-content button:hover {
  background-color: #004285;
}

.modal-content .close {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 24px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .student-header {
    flex-direction: column;
    gap: 10px;
  }
  
  .student-details {
    overflow-x: auto;
  }
}
</style>