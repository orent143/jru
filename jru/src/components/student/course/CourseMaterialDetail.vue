<template>
  <div class="course-content-container">
    <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="course-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
      <div class="material-detail-container" v-if="currentMaterial">
        <button class="back-btn" @click="goBack">
          <i class="pi pi-arrow-left"></i> Back to Course
        </button>

        <div class="material-content">
          <div class="main-content">
            <div class="material-header">
              <div class="header-content">
                <h1>{{ currentMaterial.title }}</h1>
                <div class="material-meta">
                  <span class="posted-date">
                    <i class="pi pi-calendar"></i> 
                    Posted: {{ formatDate(currentMaterial.datePosted) }}
                  </span>
                  <span class="due-date">
                    <i class="pi pi-clock"></i> 
                    Due: {{ formatDate(currentMaterial.dueDate) }}
                  </span>
                  <span class="status" :class="currentMaterial.status.toLowerCase()">
                    {{ currentMaterial.status }}
                  </span>
                </div>
              </div>
            </div>

            <div class="content-section instructions">
              <h2>Instructions</h2>
              <div class="instruction-content">
                <p>{{ currentMaterial.description }}</p>
                <div class="attachments">
                  <h3>Attachments</h3>
                  <div v-for="file in currentMaterial.attachments" 
                       :key="file.id"
                       class="attachment-item"
                       @click="downloadAttachment(file)">
                    <i :class="getFileIcon(file.type)"></i>
                    <span>{{ file.name }}</span>
                    <i class="pi pi-download" v-if="file.type !== 'link'"></i>
                    <i class="pi pi-link" v-if="file.type === 'link'"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="side-content">
            <div class="content-section submission">
              <h2>Your Work</h2>
              <div class="submission-area">
                <div class="submission-status">
                  <div class="status-indicator" 
                       :class="currentMaterial.status.toLowerCase()">
                    {{ currentMaterial.status }}
                  </div>
                </div>
                <div class="submission-actions">
                  <button class="upload-btn primary">
                    <i class="pi pi-upload"></i> Add or create
                  </button>
                </div>
              </div>
            </div>

            <div class="content-section comments">
              <h2>Class Comments</h2>
              <div class="comments-section">
                <div class="comment-input">
                  <input type="text"
                         v-model="newComment"
                         placeholder="Add class comment..."
                         @keyup.enter="addComment" />
                  <button class="send-btn" @click="addComment">
                    <i class="pi pi-send"></i>
                  </button>
                </div>
                <div class="comments-list">
                  <div v-for="comment in currentMaterial.comments"
                       :key="comment.id"
                       class="comment">
                    <img :src="comment.authorAvatar" :alt="comment.author" />
                    <div class="comment-content">
                      <div class="comment-header">
                        <h4>{{ comment.author }}</h4>
                        <span class="comment-date">
                          {{ formatDate(comment.date) }}
                        </span>
                      </div>
                      <p>{{ comment.text }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '../Header.vue';
import Sidebar from '../Sidebar.vue';

export default {
  name: 'CourseMaterialDetail',
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
            attachments: [{ id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }],
            submittedFiles: [],
            comments: [{ id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }]
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
        announcements: [{ id: 1, message: 'Welcome to ITELECT4!' }],
        assignments: [{ id: 1, name: 'Assignment 1', dueDate: '2024-02-01' }]
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
        assignments: [{ id: 1, name: 'Case Study Analysis', dueDate: '2024-02-10' }]
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
        assignments: [{ id: 1, name: 'Pattern Implementation', dueDate: '2024-02-15' }]
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
        assignments: [{ id: 1, name: 'Framework Project', dueDate: '2024-02-20' }]
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
        assignments: [{ id: 1, name: 'Database Project', dueDate: '2024-02-25' }]
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
        assignments: [{ id: 1, name: 'Mobile App Project', dueDate: '2024-03-01' }]
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
        assignments: [{ id: 1, name: 'Visualization Project', dueDate: '2024-02-28' }]
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
        assignments: [{ id: 1, name: 'Testing Project', dueDate: '2024-02-22' }]
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
        assignments: [{ id: 1, name: 'Security Project', dueDate: '2024-02-18' }]
      }
    ]
  };
},
  computed: {
    currentCourse() {
      const courseId = parseInt(this.$route.params.courseId);
      return this.courses.find(c => c.id === courseId);
    },
    currentMaterial() {
      if (!this.currentCourse) return null;
      const materialId = parseInt(this.$route.params.materialId);
      return this.currentCourse.materials.find(m => m.id === materialId);
    }
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    getFileIcon(type) {
      const icons = {
        pdf: 'pi pi-file-pdf',
        doc: 'pi pi-file-word',
        docx: 'pi pi-file-word',
        xls: 'pi pi-file-excel',
        xlsx: 'pi pi-file-excel',
        zip: 'pi pi-file-export',
        video: 'pi pi-video',
        link: 'pi pi-link',
        default: 'pi pi-file'
      };
      return icons[type] || icons.default;
    },
    downloadAttachment(file) {
      if (file.type === 'link') {
        window.open(file.name, '_blank');
      } else {
        console.log('Downloading:', file.name);
        // Actual download logic for file types (e.g., via API or static assets)
      }
    },
    goBack() {
      this.$router.push({
        name: 'CourseContent',
        params: { courseId: this.$route.params.courseId }
      });
    },
    addComment() {
      if (this.newComment.trim()) {
        const newCommentObj = {
          id: Date.now(), // Consider a more reliable ID generator
          author: 'You',
          authorAvatar: '/your-avatar.png',
          text: this.newComment,
          date: new Date().toISOString()
        };
        this.currentMaterial.comments.unshift(newCommentObj);
        this.newComment = '';
      }
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

.material-detail-container {
  flex: 1;
  padding: 1rem;
  max-width: 100%;
  margin: 0 auto;
  overflow-y: auto; /* This will enable vertical scrolling */
  max-height: 100%; /* Set a maximum height for the container */
  
}
.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.back-btn:hover {
  background-color: #f0f0f0;
}


.material-content {
  display: grid;
  grid-template-columns: 3fr 1fr;
  gap: 2rem;
  height: 100%; /* Ensure content takes up full height */
  margin-bottom: 5rem; /* Add bottom margin here */
}


.main-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.side-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  margin-bottom: 2rem; /* Add bottom margin here */
}


.material-header {
  background-color: #D9D9D9;
  padding: 2rem;
  border-radius: 8px;
}

.material-header h1 {
  color: #333;
}

.material-meta {
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
  color: #666;
}

.content-section {
  background-color: #D9D9D9;
  padding: 1.5rem;
  border-radius: 8px;
  min-height: 300px;
  color: #212121;
}

.content-section h2 {
  margin-bottom: 1.5rem;
  font-size: 1.25rem;

  color: #333;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.instruction-content {
  color: #666;
}

.upload-btn {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 20px;
  font-size: 100%;
  font-weight: 800;
  background-color: #F5F5F5;
  color: rgba(0, 0, 0, 0.781);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.comments-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px; /* Adjust this value to fit your design */
  overflow-y: auto; /* Enable vertical scrolling */
}

.comment-input {
  display: flex;
  gap: 0.5rem;
}

.comment-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.comment {
  display: flex;
  gap: 1rem;
  background-color: #fff;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.comment img {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.comment-content {
  flex: 1;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.status.not-submitted {
  background-color: #FF6B6B;
  color: white;
}

.status.pending {
  background-color: #FFDD57;
  color: black;
}

.status.upcoming {
  background-color: #4C9A2A;
  color: white;
}
</style>
