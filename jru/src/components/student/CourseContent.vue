<template>
  <div class="course-content-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="course-main" v-if="course">
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

        <div class="course-hero">
          <div class="content-left">
            <section class="announcements">
              <h3>Announcements:</h3>
              <ul>
                <li v-for="announcement in course.announcements" 
                    :key="announcement.id">
                  {{ announcement.message }}
                </li>
              </ul>
            </section>
            <section class="assignments">
              <h3>Assignments:</h3>
              <ul>
                <li v-for="assignment in course.assignments" 
                    :key="assignment.id">
                  {{ assignment.name }} - Due: {{ assignment.dueDate }}
                </li>
              </ul>
            </section>
          </div>

          <div class="content-right">
            <section class="course-materials">
              <h3>Course Materials</h3>
              <div class="material-cards">
                <div v-for="material in course.materials" 
                     :key="material.id"
                     class="material-card"
                     @click="navigateToMaterial(material)">
                  <div class="card-header">
                    <i class="pi pi-clipboard"></i>
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
import Sidebar from './Sidebar.vue';

export default {
  components: {
    Header,
    Sidebar
  },
  data() {
    return {
      student: { name: 'John Doe' },
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [
        {
          id: 1,
          name: 'ITELECT4',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Course Material',
              description: 'Complete the following programming exercises...',
              datePosted: '2024-01-20',
              dueDate: '2024-02-01',
              status: 'Not submitted',
              attachments: [
                { id: 1, name: 'assignment1.pdf', type: 'pdf' }
              ],
              submittedFiles: [],
              comments: [
                {
                  id: 1,
                  author: 'Teacher',
                  authorAvatar: '/avatar.png',
                  text: 'Please submit before deadline',
                  date: '2024-01-20'
                }
              ]
            },
            {
              id: 2,
              title: 'KAPOYAAAA',
              description: 'Required readings for Week 1',
              datePosted: '2024-01-20',
              dueDate: '2024-02-01',
              status: 'not_started',
              attachments: [],
              submittedFiles: [],
              comments: []
            },
            {
              id: 3,
              title: 'bidjo',
              description: 'Required readings for Week 1',
              datePosted: '2024-01-20',
              dueDate: '2024-02-01',
              status: 'not_started',
              attachments: [],
              submittedFiles: [],
              comments: []
            },
            {
              id: 4,
              title: 'New Course Material 1',
              description: 'Read Chapter 1 and complete the exercises.',
              datePosted: '2024-01-25',
              dueDate: '2024-02-05',
              status: 'Not submitted',
              attachments: [{ id: 1, name: 'chapter1.pdf', type: 'pdf' }],
              submittedFiles: [],
              comments: []
            },
            {
              id: 5,
              title: 'New Course Material 2',
              description: 'Watch the introductory video and answer the questions.',
              datePosted: '2024-01-26',
              dueDate: '2024-02-06',
              status: 'Not started',
              attachments: [{ id: 1, name: 'intro-video.mp4', type: 'video' }],
              submittedFiles: [],
              comments: []
            }
          ],
          announcements: [
            { id: 1, message: 'Welcome to ITELECT4!' }
          ],
          assignments: [
            { id: 1, name: 'Assignment 1', dueDate: '2024-02-01' }
          ]
        },
        {
          id: 2,
          name: 'GEC010',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Understanding Ethics in Technology',
              description: 'Week 1: Introduction to Tech Ethics',
              datePosted: '2024-01-22',
              dueDate: '2024-02-05',
              status: 'Not submitted',
              attachments: [
                { id: 1, name: 'ethics_intro.pdf', type: 'pdf' },
                { id: 2, name: 'case_study1.docx', type: 'docx' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Quiz on Monday: Ethics in Computing' },
            { id: 2, message: 'Reading assignment due soon: Chapter 3' }
          ],
          assignments: [
            { id: 1, name: 'Case Study Analysis', dueDate: '2024-02-10' }
          ]
        },
        {
          id: 3,
          name: 'CC321',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Software Design Patterns',
              description: 'Learn common design patterns in software development',
              datePosted: '2024-01-15',
              dueDate: '2024-02-01',
              status: 'Pending',
              attachments: [
                { id: 1, name: 'design_patterns.pdf', type: 'pdf' },
                { id: 2, name: 'https://github.com/example/patterns', type: 'link' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Implementation of Design Patterns' },
            { id: 2, message: 'Reading assignment due soon: Observer Pattern' }
          ],
          assignments: [
            { id: 1, name: 'Pattern Implementation', dueDate: '2024-02-15' }
          ]
        },
        {
          id: 4,
          name: 'ITELECT3',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Web Development Frameworks',
              description: 'Introduction to modern web frameworks',
              datePosted: '2024-01-18',
              dueDate: '2024-02-03',
              status: 'Not started',
              attachments: [
                { id: 1, name: 'frameworks_intro.pdf', type: 'pdf' },
                { id: 2, name: 'demo_code.zip', type: 'zip' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Framework Implementation' },
            { id: 2, message: 'Reading assignment due soon: Vue.js Basics' }
          ],
          assignments: [
            { id: 1, name: 'Framework Project', dueDate: '2024-02-20' }
          ]
        },
        {
          id: 5,
          name: 'IT321',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Database Management',
              description: 'Advanced database concepts and implementation',
              datePosted: '2024-01-20',
              dueDate: '2024-02-05',
              status: 'In Progress',
              attachments: [
                { id: 1, name: 'database_concepts.pdf', type: 'pdf' },
                { id: 2, name: 'sql_exercises.xlsx', type: 'xlsx' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Database Design' },
            { id: 2, message: 'Reading assignment due soon: Normalization' }
          ],
          assignments: [
            { id: 1, name: 'Database Project', dueDate: '2024-02-25' }
          ]
        },
        {
          id: 6,
          name: 'ITFELECT1',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Mobile Development',
              description: 'Introduction to mobile app development',
              datePosted: '2024-01-25',
              dueDate: '2024-02-10',
              status: 'Not submitted',
              attachments: [
                { id: 1, name: 'mobile_dev_basics.pdf', type: 'pdf' },
                { id: 2, name: 'https://youtube.com/tutorial', type: 'link' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Mobile UI Design' },
            { id: 2, message: 'Midterm scheduled for next month' }
          ],
          assignments: [
            { id: 1, name: 'Mobile App Project', dueDate: '2024-03-01' }
          ]
        },
        {
          id: 7,
          name: 'ELEC026',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Data Visualization',
              description: 'Learn data visualization techniques',
              datePosted: '2024-01-22',
              dueDate: '2024-02-07',
              status: 'Submitted',
              attachments: [
                { id: 1, name: 'visualization_tools.pdf', type: 'pdf' },
                { id: 2, name: 'dataset.xlsx', type: 'xlsx' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Quiz on Monday: Data Visualization Tools' },
            { id: 2, message: 'Reading assignment due soon: Chart Types' }
          ],
          assignments: [
            { id: 1, name: 'Visualization Project', dueDate: '2024-02-28' }
          ]
        },
        {
          id: 8,
          name: 'CC311',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Software Testing',
              description: 'Introduction to software testing methodologies',
              datePosted: '2024-01-19',
              dueDate: '2024-02-04',
              status: 'Not started',
              attachments: [
                { id: 1, name: 'testing_basics.pdf', type: 'pdf' },
                { id: 2, name: 'test_cases.docx', type: 'docx' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Unit Testing' },
            { id: 2, message: 'Reading assignment due soon: Test Cases' }
          ],
          assignments: [
            { id: 1, name: 'Testing Project', dueDate: '2024-02-22' }
          ]
        },
        {
          id: 9,
          name: 'CC313',
          sections: [{ id: 1, name: 'BSCS-3A' }],
          materials: [
            {
              id: 1,
              title: 'Information Security',
              description: 'Fundamentals of information security',
              datePosted: '2024-01-21',
              dueDate: '2024-02-06',
              status: 'In Progress',
              attachments: [
                { id: 1, name: 'security_basics.pdf', type: 'pdf' },
                { id: 2, name: 'security_lab.zip', type: 'zip' }
              ]
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week: Security Analysis' },
            { id: 2, message: 'Reading assignment due soon: Encryption' }
          ],
          assignments: [
            { id: 1, name: 'Security Project', dueDate: '2024-02-18' }
          ]
        }
      ]
    };
  },
  computed: {
    course() {
      const courseId = parseInt(this.$route.params.courseId);
      const foundCourse = this.courses.find(c => c.id === courseId);

      if (!foundCourse) {
        this.$router.push('/student-dashboard'); // Redirect to the dashboard if course is not found
        return null;
      }
      return foundCourse;
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    navigateToMaterial(material) {
      this.$router.push({
        name: 'MaterialDetail',
        params: {
          courseId: this.$route.params.courseId,
          materialId: material.id.toString()
        }
      });
    }
  }
};
</script>



<style scoped>
.course-content-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden; /* Prevent overall overflow */
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
  /* Removed overflow: auto */
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
  flex: 1;
  overflow: auto; /* Allow scrolling in the course-hero section */
  max-height: 60vh; /* Adjust this value as needed to fit your design */
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 1;
  width: 20%;
  overflow: auto; /* Allow scrolling */
}

.content-right {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  flex: 2;
  width: 50%;
  padding-left: 2rem;
  overflow: auto; /* Allow scrolling */
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
