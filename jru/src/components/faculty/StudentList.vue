<template>
    <div class="course-content-container">
      <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      <div class="container">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        <div class="content">
          <div class="student-list-content">
            <div class="student-header">
              <h1>Students List</h1>
              <button class="add-student-btn" @click="showAddStudentModal = true">
                Add Student
              </button>
            </div>
  
            <div class="student-details">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Section</th> 
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="student in students" :key="student.id">
                    <td>{{ student.id }}</td>
                    <td>{{ student.name }}</td>
                    <td>{{ student.email }}</td>
                    <td>{{ student.section }}</td>
                    <td>
                      <span :class="['status', student.status]">{{ student.status }}</span>
                    </td>
                    <td>
                      <button class="edit-btn" @click="editStudent(student)">Edit</button>
                      <button class="delete-btn" @click="deleteStudent(student.id)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script>
  import Header from './header.vue';
  import Sidebar from './SideBar.vue';
  
  export default {
    name: 'StudentList',
    components: {
      Header,
      Sidebar
    },
    props: {
      courseId: {
        type: String,
        required: true
      }
    },
    data() {
      return {
        teacher: { name: 'Professor Smith' },
        searchQuery: '',
        isSidebarCollapsed: false,
        showAddStudentModal: false,
        courseName: 'ITELECT4',
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
              }
            ],
            students: [
              {
                id: 1,
                name: 'John Smith',
                email: 'john@email.com',
                section: 'BSCS-3A',
                status: 'Active'
              },
              {
                id: 2,
                name: 'Alice Johnson',
                email: 'alice@email.com',
                section: 'BSCS-3A',
                status: 'Active'
              }
            ]
          }
        ],
        students: [
          {
            id: 1,
            name: 'John Smith',
            email: 'john@email.com',
            section: 'BSCS-3A',
            status: 'Active'
          },
          {
            id: 2,
            name: 'Alice Johnson',
            email: 'alice@email.com',
            section: 'BSCS-3A',
            status: 'Active'
          }
        ]
      }
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      },
      editStudent(student) {
        // Implement edit functionality
        console.log('Edit student:', student);
      },
      deleteStudent(id) {
        // Implement delete functionality
        console.log('Delete student:', id);
      }
    }
  }
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
    height: calc(100vh - 50px);
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
    font-size: 24px;
    color: #333;
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