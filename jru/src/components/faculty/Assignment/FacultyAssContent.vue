<template>
    <div class="course-content-container">
        <Header :teacher="teacher" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="course-content">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <main class="course-main" v-if="course">
                <div class="course-header">
                    <h2>{{ course.name }} - Assignments</h2>
                    <button class="add-btn" @click="showAddAssignmentModal = true">+</button>
                    <div class="course-sections">
                        <ul>
                            <li v-for="section in course.sections" :key="section.id">
                                {{ section.name }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="course-hero">
                    <div class="content-left">
                        <section class="assignments-summary">
                            <h3>Due Soon:</h3>
                            <div class="assignment-list">
                                <ul>
                                    <li v-for="assignment in upcomingAssignments" :key="assignment.id">
                                        {{ assignment.title }} - Due: {{ assignment.dueDate }}
                                    </li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    <div class="content-right">
                        <section class="assignments">
                            <h3>All Assignments</h3>
                            <div class="material-cards">
                                <div v-for="assignment in course.assignments" :key="assignment.id" 
                                     class="material-card" @click="navigateToAssignment(assignment)">
                                    <div class="card-header">
                                        <i class="pi pi-file-edit"></i>
                                        <h4>Teacher posted a new assignment:</h4>
                                        {{ assignment.title }}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>
        </div>

        <AddAssignmentModal v-if="showAddAssignmentModal" 
                            @close="showAddAssignmentModal = false" 
                            @add-assignment="addAssignment" />
    </div>
</template>

<script>
import Header from '../header.vue';
import Sidebar from '../SideBar.vue';

export default {
    components: {
        Header,
        Sidebar,
    },
    data() {
        return {
            teacher: { name: 'Professor Smith' },
            searchQuery: '',
            isSidebarCollapsed: false,
            showAddAssignmentModal: false,
            courses: [
                {
                    id: 1,
                    name: 'ITELECT4',
                    sections: [{ id: 1, name: 'BSCS-3A' }],
                    assignments: [
                        {
                            id: 1,
                            title: 'Programming Assignment 1',
                            description: 'Create a simple calculator application',
                            datePosted: '2024-02-01',
                            dueDate: '2024-02-15',
                            status: 'Open',
                            points: 100,
                            submissions: []
                        },
                        {
                            id: 2,
                            title: 'Database Design Project',
                            description: 'Design a database schema for a library system',
                            datePosted: '2024-02-03',
                            dueDate: '2024-02-17',
                            status: 'Open',
                            points: 150,
                            submissions: []
                        }
                    ]
                }
            ]
        };
    },
    computed: {
        course() {
            const courseId = parseInt(this.$route.params.courseId);
            return this.courses.find(c => c.id === courseId) || null;
        },
        upcomingAssignments() {
            if (!this.course) return [];
            const today = new Date();
            return this.course.assignments
                .filter(assignment => new Date(assignment.dueDate) > today)
                .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                .slice(0, 5);
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },
        navigateToAssignment(assignment) {
            this.$router.push({
                name: 'FacultyAssignmentDetails',
                params: {
                    courseId: this.$route.params.courseId,
                    assignmentId: assignment.id.toString()
                }
            });
        },
        addAssignment(newAssignment) {
            this.course.assignments.push(newAssignment);
            this.showAddAssignmentModal = false;
        },
        getStatusClass(status) {
            return {
                'status-open': status === 'Open',
                'status-closed': status === 'Closed',
                'status-graded': status === 'Graded'
            };
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
}

.course-main {
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Course Header */
.course-header {
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-radius: 20px;
  background-color: #D9D9D9;
  position: relative;
}
/* Add Material Button */
.add-btn {
  position: absolute;
  top: 15px;
  right: 20px;
  background-color: #2c3e50;
  color: white;
  border: none;
  font-size: 1.5rem;
  font-weight: bold;
  padding: 8px 15px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s ease;
}

.add-btn:hover {
  background-color: #1a252f;
}

.course-header h2 {
  font-size: 2rem;
  font-weight: 700;
  color: #000;
}

.course-sections ul {
  list-style: none;
  padding-left: 0;
}

.course-sections li {
  font-size: 1.1rem;
  color: #181818;
  margin-bottom: 0.5rem;
}

/* Main Content Layout */
.course-hero {
  display: flex;
  flex: 1;
  overflow: auto; /* Allow scrolling in the course-hero section */
  max-height: 60vh; /* Adjust as needed */
}

/* Left Panel */
.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 25%;
  overflow: auto;
}

/* Right Panel */
.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto;
}

/* Course Materials */
.course-materials {
  display: flex;
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
  display: flex;
  align-items: center;
  padding: 1rem;
}

.material-card:hover {
  transform: translateY(-5px);
}

.material-card i {
  font-size: 1.5rem;
  color: #2c3e50;
}

/* Announcements & Assignments */
.assignments-summary {
  background-color: #D9D9D9;
  padding: 1rem;
  border-radius: 8px;
  width: 100%;
  position: relative;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  color: #333;
}

.card-header h4 {
  font-size: 1.2rem;
  font-weight: 500;
  color: #333;
}

.card-body {
  font-size: 1rem;
  color: #666;
  margin-top: 0.5rem;
}

.assignments-summary h3 {
  font-size: 17px;
  font-weight: 600;
  color: #000000d2;
}

.assignments-summary ul {
  list-style: none;
  padding-left: 0;
  
}
.assignments-summary li {
  font-size: 1.1rem;
  color: #444;
  margin-bottom: 0.5rem;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.3rem;
  color: #333;
}

.form-group input {
  padding: 0.5rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.form-group input::placeholder {
  color: #aaa;
}

/* Section Titles */
.course-materials h3,
.quizzes h3 {
  font-size: 1.5rem;
  color: #2c3e50;
}
.student-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.view-btn {
  background-color: #2c3e50;
  color: rgb(255, 255, 255);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  position: absolute;
  top: 10px;
  right: 10px;
}

.view-btn:hover {
  background-color: #1a252f;
}
/* Responsive Design */
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