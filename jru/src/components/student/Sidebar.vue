<template>
  <aside class="sidebar" :class="{'collapsed': isCollapsed}">
    <ul>
      <!-- Home Section -->
      <li>
        <i class="pi pi-home"></i>
        <router-link to="/student-dashboard"><strong>Home</strong></router-link>
      </li>

      <!-- Courses Dropdown -->
      <li @click="toggleCoursesDropdown" :aria-expanded="isCoursesDropdownOpen.toString()">
        <i class="pi pi-book"></i>
        <strong>Courses</strong>
        <i v-if="isCoursesDropdownOpen" class="pi pi-angle-down"></i>
        <i v-else class="pi pi-angle-right"></i>
      </li>
      <ul v-if="isCoursesDropdownOpen" class="dropdown-menu">
        <li v-for="course in courses" :key="course.id">
          <!-- Dynamic Link to Course Content -->
          <router-link :to="`/course/${course.id}`">{{ course.name }}</router-link>
        </li>
      </ul>

      <!-- Assignments Section -->
      <li>
        <i class="pi pi-pen-to-square"></i>
        <strong>Assignments</strong>
      </li>

      <!-- Tests Dropdown -->
      <li @click="toggleTestsDropdown" :aria-expanded="isTestsDropdownOpen.toString()">
        <i class="pi pi-file-edit"></i>
        <strong>Tests</strong>
        <i v-if="isTestsDropdownOpen" class="pi pi-angle-down"></i>
        <i v-else class="pi pi-angle-right"></i>
      </li>
      <ul v-if="isTestsDropdownOpen" class="dropdown-menu">
        <li>Quiz</li>
        <li>Exam</li>
      </ul>

      <!-- Grades Section -->
      <li>
        <i class="pi pi-graduation-cap"></i>
        <strong>Grades</strong>
      </li>

      <!-- Profile Section -->
    </ul>
  </aside>
</template>

<script>
export default {
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    courses: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isCoursesDropdownOpen: false,
      isTestsDropdownOpen: false,
    };
  },
  methods: {
    toggleCoursesDropdown() {
      this.isCoursesDropdownOpen = !this.isCoursesDropdownOpen;
    },
    toggleTestsDropdown() {
      this.isTestsDropdownOpen = !this.isTestsDropdownOpen;
    },
  },
};
</script>

<style scoped>
/* Sidebar styles */
.sidebar {
  width: 220px;
  background-color: #002244;
  padding-top: 1rem;
  transition: width 0.3s ease, transform 0.3s ease;
  font-family: 'Roboto', sans-serif;
  height: 100vh; /* Ensures the sidebar takes the full height of the viewport */
  overflow-y: auto; /* Enables vertical scrolling */
  position: relative; /* Ensures scrolling behavior works as intended */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.884);
}

/* Sidebar collapse effect */
.sidebar.collapsed {
  width: 70px;
  transform: translateX(-100%);
}

/* Sidebar list styles */
.sidebar ul {
  list-style-type: none;
  padding-left: 10px;
  margin: 0;
}

/* Individual list item styles */
.sidebar li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s ease, color 0.3s ease, transform 0.3s ease;
}

/* Hover effect for list items */
.sidebar li:hover {
  background-color: #007bf6;
  width: 200px;
  color: #ffffff;
}

.sidebar li:hover i {
  color: #ffffff;
}

.sidebar li:hover strong {
  color: #ffffff;
  transform: scale(0.95);
}

/* Styling for strong text inside sidebar */
.sidebar li strong {
  color: #ffffff;
  text-decoration: none;
  font-weight: 750;
  font-size: 17px;
  display: flex;
  align-items: center;
  padding: 1px 5px;
  margin: 8px;
}

/* Dropdown menu item styles */
.sidebar .dropdown-menu li {
  color: #ffffff;
  font-size: 13px;
  font-weight: bold;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  padding: 3px 40px;
  margin: 7px;
}

/* Hover effect for dropdown menu items */
.sidebar .dropdown-menu li:hover {
  background-color: #003355;
  width: 160px;
  color: #ffffff;
}

/* Icon styles */
.sidebar li i {
  margin-right: 10px;
  transition: transform 0.3s ease;
  font-size: 20px;
  color: #ffffff;
}

.sidebar li:hover i {
  color: #ffffff;
}

/* Custom scrollbar styles */
.sidebar::-webkit-scrollbar {
  width: 8px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: #007bf600;
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-track {
  background: #f1f1f100;
}

/* Ensuring the dropdown menu can scroll if the content is long */
.sidebar .dropdown-menu {
  max-height: 300px; /* Set a max height for the dropdown */
  overflow-y: auto;  /* Enable scrolling if content exceeds max height */
}

</style>
