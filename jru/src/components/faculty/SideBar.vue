<template>
    <aside class="sidebar" :class="{'collapsed': isCollapsed}">
        <ul>
            <li>
                <router-link to="/faculty-dashboard">
                    <i class="pi pi-home"></i>
                    <strong>Home</strong>
                </router-link>
            </li>

            <li>
                <router-link to="/faculty/courses">
                    <i class="pi pi-book"></i>
                    <strong>View Courses</strong>
                </router-link>
            </li>

            <li>
                <router-link to="/faculty/calendar">
                    <i class="pi pi-calendar"></i>
                    <strong>View Calendar</strong>
                </router-link>
            </li>

            <li @click="toggleTestsDropdown" :aria-expanded="isTestsDropdownOpen.toString()">
                <i class="pi pi-file"></i>
                <strong>Assessments</strong>
                <i v-if="isTestsDropdownOpen" class="pi pi-angle-down" style="width: auto; margin-left: auto; font-size: 14px;"></i>
                <i v-else class="pi pi-angle-right" style="width: auto; margin-left: auto; font-size: 14px;"></i>
            </li>
            <ul v-if="isTestsDropdownOpen" class="dropdown-menu" :class="{'open': isTestsDropdownOpen}">
                <li><router-link to="/faculty/quizzes">Quiz</router-link></li>
                <li><router-link to="/faculty/exams">Exam</router-link></li>
                <li><router-link to="/faculty/assignments">Assignments</router-link></li>
            </ul>
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
    },
    data() {
        return {
            isTestsDropdownOpen: false,
        };
    },
    methods: {
        toggleTestsDropdown() {
            this.isTestsDropdownOpen = !this.isTestsDropdownOpen;
        },
    },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: linear-gradient(180deg, #001a33 0%, #002244 100%);
  padding-top: 1.5rem;
  transition: all 0.3s ease;
  height: 100vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.sidebar.collapsed {
  width: 70px;
  transform: translateX(-100%);
}

.sidebar ul {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
}

.sidebar > ul {
  padding: 0 8px;
}

.sidebar li {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 10px 15px;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: all 0.2s ease;
  gap: 5px;

}

.sidebar li:hover {
  background-color: rgba(0, 123, 246, 0.8);
  color: #ffffff;
  transform: translateX(5px);
}

.sidebar li:active {
  transform: translateX(5px) scale(0.98);
}

.sidebar li strong {
  color: #f5f5f5;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.3px;
  margin-left: 8px;
  transition: all 0.2s ease;
}

.sidebar .dropdown-menu {
  padding-left: 25px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.sidebar .dropdown-menu.open {
  max-height: 300px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.sidebar .dropdown-menu li {
  color: #e0e0e0;
  font-size: 14px;
  padding: 8px 12px;
  margin-bottom: 3px;
  border-radius: 6px;
  border-left: 2px solid rgba(255, 255, 255, 0.1);
}

.sidebar .dropdown-menu li:hover {
  background-color: rgba(0, 51, 85, 0.6);
  border-left: 2px solid #007bf6;
}

.sidebar li i {
  font-size: 18px;
  color: #8ca8c9;
  transition: all 0.2s ease;
  width: 24px;
  text-align: center;
}

.sidebar li:hover i {
  color: #ffffff;
}

.sidebar li:hover strong {
  color: #ffffff;
}

.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar a {
  text-decoration: none;
  color: inherit;
  width: 100%;
  display: flex;
  align-items: center;
}
</style>