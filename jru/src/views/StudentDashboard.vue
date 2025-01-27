<template>
  <div class="dashboard-container">
    <!-- Header -->
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />

    <div class="dashboard-content">
      <!-- Sidebar -->
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <!-- Main Dashboard Area -->
      <main class="dashboard-main">
        <!-- Course Cards (Sections & Announcements) -->
        <section class="course-cards">
          <div class="course-card" v-for="course in courses" :key="course.id" @click="navigateToCourse(course.id)">
            <div class="course-info">
              <h4 class="course-name">{{ course.name }}</h4>
              <div class="sections">
                <ul>
                  <li v-for="section in course.sections" :key="section.id">
                    {{ section.name }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="announcements-container">
              <h5>Announcements:</h5>
              <ul>
                <li v-for="announcement in course.announcements" :key="announcement.id">
                  <span class="announcement-message">{{ announcement.message }}</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>


<script>
import Header from '../components/student/Header.vue';
import Sidebar from '../components/student/Sidebar.vue';

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
          sections: [
            { id: 1, name: 'BSCS-3A' },
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            {message: 'Midterm scheduled for next month' }
          ]
        },
        {
          id: 2,
          name: 'GEC010',
          sections: [
            { id: 1, name: 'BSCS-3A' },
          ],
          announcements: [
            { message: 'Quiz on Monday' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 3,
          name: 'CC321',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 4,
          name: 'ITELECT3',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 5,
          name: 'IT321',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 6,
          name: 'ITFELECT1',
          sections: [
            { id: 1, name: 'BSCS-3A' },
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            {message: 'Midterm scheduled for next month' }
          ]
        },
        {
          id: 7,
          name: 'ELEC026',
          sections: [
            { id: 1, name: 'BSCS-3A' },
          ],
          announcements: [
            { message: 'Quiz on Monday' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 8,
          name: 'CC311 ',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 9,
          name: 'CC313',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        {
          id: 10,
          name: 'CC321',
          sections: [
            { id: 1, name: 'BSCS-3A' }
          ],
          announcements: [
            { message: 'Assignment 2 due next week' },
            { message: 'Reading assignment due soon' }
          ]
        },
        // Add more courses and sections...
      ],
      searchQuery: '',
      isSidebarCollapsed: false,
    };
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    navigateToCourse(courseId) {
      this.$router.push({ name: 'CourseContent', params: { courseId } });
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Full height of the viewport */
  overflow: hidden; /* Prevents overflow in the container itself */
}

.dashboard-content {
  display: flex;
  flex: 1; /* Take up the remaining space */
  overflow: hidden; /* Prevents overflow in the content area */
}

.dashboard-main {
  flex: 1; /* Main area should take the remaining space */
  padding: 2rem;
  overflow-y: auto; /* Allow scrolling if content overflows */
  -webkit-overflow-scrolling: touch; /* Smooth scrolling for iOS */
}

.course-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 items per row */
  gap: 4rem; /* Adds space between cards */
}

.course-card {
  background-color: #D9D9D9ff;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  width: 95%;
  height: auto;
  min-height: 200px;
  cursor: pointer; /* Change the cursor to a pointer to indicate the card is clickable */
  transition: transform 0.2s, box-shadow 0.2s; /* Add a transition effect for hover */
}

.course-card:hover {
  transform: scale(1.05); /* Slightly increase the size of the card on hover */
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2); /* Add a shadow to the card on hover */
}

.course-info, .announcements-container {
  flex-grow: 1; /* Allows both containers to grow and take available space */
}

.course-info {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 5px;
  border-bottom-right-radius: 0px;
  border-bottom-left-radius: 0px;
  display: flex;
  flex-direction: column;
}

.course-name {
  font-size: 25px;
  font-weight: 900;
  color: #000;
}

.sections ul, .announcements ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.sections li {
  margin-bottom: 0.5rem;
  color: #333333;
  font-weight: 400;
  font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.announcements-container {
  background-color: #F5F5F5;
  padding: 1rem;
  padding-top: 0%;
  border-radius: 8px;
  border-top-left-radius: 0px;
  border-top-right-radius: 0px;
  display: flex;
  flex-direction: column;
  min-height: 100px; /* Ensures that the announcements container always takes up some space even if empty */
}

.announcements-container h5 {
  font-size: 1.2rem;
  font-weight: 100;
  color: #383838;
}

.announcements li {
  margin-bottom: 0.5rem;
  color: #333;
}

.announcement-message {
  font-size: 1rem;
  color: #000;
  display: block;
  margin-top: 0.3rem;
}

.quick-links ul {
  list-style-type: none;
}

.quick-links li {
  margin-bottom: 0.5rem;
}

.quick-links a {
  color: #007bff;
}

</style>
