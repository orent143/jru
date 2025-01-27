<template>
    <div class="assignment-details">
      <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
      
      <div class="assignment-content">
        <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
        
        <main class="assignment-main">
          <h2>{{ assignment.name }}</h2>
          <p>Due Date: {{ assignment.dueDate }}</p>
          <p>Description: {{ assignment.description }}</p>
          <!-- Add more details, attachments, etc. -->
        </main>
      </div>
    </div>
  </template>
  
  <script>
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';
  export default {
    components: {
      Header,
      Sidebar
    },
    data() {
      return {
        student: {
          name: 'John Doe',
        },
        courses: [
          {
            id: 1,
            name: 'ITELECT4',
            assignments: [
              { id: 1, name: 'Assignment 1', dueDate: '2025-02-10', description: 'This is a sample assignment.' },
              { id: 2, name: 'Assignment 2', dueDate: '2025-02-15', description: 'This is another assignment.' },
            ]
          },
          // Add other courses here...
        ],
        searchQuery: '',
        isSidebarCollapsed: false,
      };
    },
    computed: {
      assignment() {
        const course = this.courses.find(course => course.id === parseInt(this.$route.params.courseId));
        return course.assignments.find(assignment => assignment.id === parseInt(this.$route.params.assignmentId));
      }
    },
    methods: {
      toggleSidebar() {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
      }
    }
  };
  </script>
  
  <style scoped>
  .assignment-details {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
  
  .assignment-content {
    display: flex;
    flex: 1;
  }
  
  .assignment-main {
    padding: 2rem;
    flex: 1;
  }
  
  .assignment-main h2 {
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .assignment-main p {
    font-size: 1.1rem;
    margin-bottom: 1rem;
  }
  </style>
  