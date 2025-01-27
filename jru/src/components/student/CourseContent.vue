<template>
  <div class="course-content-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    
    <div class="course-content">
      <!-- Sidebar Component -->
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <main class="course-main">
        <!-- Course Name and Section at the Top -->
        <div class="course-header">
          <h2>{{ course.name }} - Course Content</h2>
          <div class="course-sections">
            <ul>
              <li v-for="section in course.sections" :key="section.id">
                {{ section.name }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Main Content: Left part for Announcements & Assignments -->
        <div class="course-hero">
          <div class="content-left">
            <section class="announcements">
              <h3>Announcements:</h3>
              <ul>
                <li v-for="announcement in course.announcements" :key="announcement.id">
                  {{ announcement.message }}
                </li>
              </ul>
            </section>

            <section class="assignments">
              <h3>Assignments:</h3>
              <ul>
                <li v-for="assignment in course.assignments" :key="assignment.id">
                  {{ assignment.name }} - Due: {{ assignment.dueDate }}
                </li>
              </ul>
            </section>
          </div>

          <!-- Right part for Course Materials, Quizzes, etc. -->
          <div class="content-right">
            <section class="course-materials">
              <h3>Course Materials</h3>
              <div class="material-cards">
                <div v-for="(material, index) in course.materials" :key="index" class="material-card" @click="openMaterial(material.link)">
                  <div class="card-header">
                    <i class="pi pi-clipboard" style="margin-right: 10px;"></i>
                    <h4>Teacher posted a new material:</h4>
                    {{ material.title }}
                  </div>
                 
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>


<script>
import Header from './Header.vue';
import Sidebar from './Sidebar.vue'; // Import Sidebar Component

export default {
  components: {
    Header,
    Sidebar,  // Register Sidebar Component
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
          sections: [{ id: 1, name: 'BSCS-3A' }],
          announcements: [{ id: 1, message: "First announcement" }],
          assignments: [{ id: 1, name: "Assignment 1", dueDate: "2025-02-01" }],
          materials: [
            { title: 'Lecture Notes',  link: 'https://example.com/lecture-notes' },
            { title: 'Reading Materials', link: 'https://example.com/reading-materials' },
          ],
        },
            {
          id: 2,
          name: 'GEC010',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
        {
          id: 3,
          name: 'CC321',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
            {
          id: 4,
          name: 'ITELECT3',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
        {
          id: 5,
          name: 'IT321',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
            {
          id: 6,
          name: 'ITFELECT1',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
        {
          id: 7,
          name: 'ELEC026',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
            {
          id: 8,
          name: 'CC311 ',
          sections: [
            { id: 1, name: 'BSCS-3A' }
        ]
        },
        // Add more courses as needed
        ],
      searchQuery: '',
      isSidebarCollapsed: false,
    };
  },
  computed: {
    course() {
      return this.courses.find(course => course.id === parseInt(this.$route.params.courseId));
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    openMaterial(link) {
      window.open(link, '_blank'); // Opens the material link in a new tab
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

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
/* Course Header (Top of the Main Content) */
.course-header {
  display: flex;
  flex-direction: column;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
}

.course-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000000; /* Blue color for the course name */
}

.course-sections ul {
  list-style-type: none;
  padding-left: 0;
}

.course-sections li {
  font-size: 1.1rem;
  color: #181818; /* Lighter gray for list items */
  margin-bottom: 0.5rem;
}

/* Content Area Layout */
.course-hero {
  display: flex;
}
.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 20%;
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
}
.course-materials {
  flex-direction: column;

}

.material-cards {
  display: grid;
  gap: 1.5rem;
}

.material-card {
  background-color: #D9D9D9;
  border-radius: 8px;
  height: 80px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s ease;
  flex-direction: row; /* Make the layout horizontal */
  padding: 1rem;
  display: flex;
  align-items: center; /* Vertically center the content */
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem; /* Adjust the size of the icon */
  color: #2c3e50;    /* Change the icon color if needed */
}


/* Announcements & Assignments */
.announcements, .assignments {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
}
.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
    color: #333;
}
.card-header h4{
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}
.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.announcements h3, .assignments h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2; /* Darker color for section headings */
}

.announcements ul, .assignments ul {
  list-style-type: none;
  padding-left: 0;
}

.announcements li, .assignments li {
  font-size: 1.1rem;
  color: #444; /* Dark gray for text inside lists */
  margin-bottom: 0.5rem;
}

/* Form Groups for Course Materials, Quizzes, etc. */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #333; /* Color for labels */
}

.form-group input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input::placeholder {
  color: #aaa; /* Lighter gray for placeholder text */
}

/* Right Section Titles */
.course-materials h3, .quizzes h3 {
  font-size: 1.5rem;
  color: #2c3e50; /* Darker color for section headings */
}

/* Responsive Design for Smaller Screens */
@media (max-width: 768px) {
  .course-content {
    flex-direction: column;
  }

  .content-left,
  .content-right {
    padding-left: 0;
    padding-right: 0;
    flex: none;
  }

  .content-right {
    padding-left: 0;
  }
}
</style>
