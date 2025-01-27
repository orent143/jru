<template>
  <div class="dashboard-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="dashboard-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <main class="dashboard-main">
        <section class="course-cards">
          <div class="course-card" 
               v-for="course in courses" 
               :key="course.id" 
               @click="navigateToCourse(course.id)">
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
                <li v-for="(announcement, index) in course.announcements" 
                    :key="index">
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
            }
          ],
          announcements: [
            { id: 1, message: 'Assignment 2 due next week' },
            { id: 2, message: 'Midterm scheduled for next month' }
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
    this.$router.push({
      name: 'CourseContent', // Route name of the course content page
      params: { courseId: courseId.toString() } // Passing the course ID as a parameter
    });
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
