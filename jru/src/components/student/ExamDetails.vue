<template>
    <div class="exam-details-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="exam-detail">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <div class="exam-detail-container" v-if="currentExam">
                <button class="back-btn" @click="goBack">
                    <i class="pi pi-arrow-left"></i> Back to Course
                </button>

                <div class="exam-content">
                    <div class="main-content">
                        <div class="exam-header">
                            <div class="header-content">
                                <h1>{{ currentExam.name }}</h1>
                                <div class="exam-meta">
                                    <span class="posted-date">
                                        <i class="pi pi-calendar"></i>
                                        Posted: {{ formatDate(currentExam.datePosted) }}
                                    </span>
                                    <span class="due-date">
                                        <i class="pi pi-clock"></i>
                                        Due: {{ formatDate(currentExam.dueDate) }}
                                    </span>
                                    <span class="status" :class="currentExam.status.toLowerCase()">
                                        {{ currentExam.status }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div class="content-section instructions">
                            <h2>Instructions</h2>
                            <div class="instruction-content">
                                <p>{{ currentExam.description }}</p>
                                <div class="attachments">
                                    <h3>Attachments</h3>
                                    <div v-for="file in currentExam.attachments" :key="file.id" class="attachment-item" @click="downloadAttachment(file)">
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
                                    <div class="status-indicator" :class="currentExam.status.toLowerCase()">
                                        {{ currentExam.status }}
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
                                    <input type="text" v-model="newComment" placeholder="Add class comment..." @keyup.enter="addComment" />
                                    <button class="send-btn" @click="addComment">
                                        <i class="pi pi-send"></i>
                                    </button>
                                </div>
                                <div class="comments-list">
                                    <div v-for="comment in currentExam.comments" :key="comment.id" class="comment">
                                        <img :src="comment.authorAvatar" :alt="comment.author" />
                                        <div class="comment-content">
                                            <div class="comment-header">
                                                <h4>{{ comment.author }}</h4>
                                                <span class="comment-date">{{ formatDate(comment.date) }}</span>
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
import Header from './Header.vue';
import Sidebar from './Sidebar.vue';

export default {
    name: 'ExamDetails',
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
                    exams: [
                        {
                            id: 1,
                            name: 'Exam 1',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Exam 2',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Exam 3',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        }
                    ]
                },
                {
                    id: 2,
                    name: 'GEC010',
                    sections: [{ id: 1, name: 'BSCS-3A' }],
                    exams: [
                        {
                            id: 1,
                            name: 'Exam 1',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Exam 2',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Exam 3',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        }
                    ]
                },
                {
                    id: 3,
                    name: 'CC321',
                    sections: [{ id: 1, name: 'BSCS-3A' }],
                    exams: [
                        {
                            id: 1,
                            name: 'Exam 1',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Exam 2',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Exam 3',
                            description: 'Complete the following exam questions...',
                            datePosted: '2024-01-20',
                            dueDate: '2024-02-01',
                            status: 'Not submitted',
                            attachments: [
                                { id: 1, name: 'https://www.youtube.com/watch?v=w3IGrm9ucFE', type: 'link' }
                            ],
                            comments: [
                                { id: 1, author: 'Teacher', authorAvatar: '/avatar.png', text: 'Please submit before deadline', date: '2024-01-20' }
                            ]
                        }
                    ]
                }
                // Include other courses and exams here
            ]
        };
    },
    computed: {
        currentCourse() {
            const courseId = parseInt(this.$route.params.courseId);
            return this.courses.find(c => c.id === courseId);
        },
        currentExam() {
            if (!this.currentCourse) return null;
            const examId = parseInt(this.$route.params.examId);
            return this.currentCourse.exams.find(e => e.id === examId);
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
                name: 'ExamContent',
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
                this.currentExam.comments.unshift(newCommentObj);
                this.newComment = '';
            }
        }
    }
};
</script>

<style scoped>
.exam-details-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.exam-detail {
    display: flex;
    flex: 1;
}

.exam-detail-container {
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

.exam-content {
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

.exam-header {
    background-color: #D9D9D9;
    padding: 2rem;
    border-radius: 8px;
}

.exam-header h1 {
    color: #333;
}

.exam-meta {
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

.attachment-item i {
    font-size: 1.25rem;
}

.comments-section {
    display: flex;
    flex-direction: column;
}

.comment-input {
    display: flex;
    gap: 0.5rem;
}

.comment-input input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.send-btn {
    background-color: #4CAF50;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    cursor: pointer;
}

.send-btn:hover {
    background-color: #45a049;
}

.comments-list {
    margin-top: 1rem;
}

.comment {
    display: flex;
    gap: 1rem;
    border-bottom: 1px solid #ddd;
    padding-bottom: 1rem;
    margin-bottom: 1rem;
}

.comment-content {
    display: flex;
    flex-direction: column;
}

.comment-header h4 {
    font-size: 1rem;
    margin-bottom: 0.2rem;
    color: #333;
}

.comment-date {
    font-size: 0.875rem;
    color: #888;
}

.status {
    padding: 0.5rem 1rem;
    border-radius: 12px;
}

.primary {
    background-color: #007bff;
}

.status.indicator {
    background-color: #f39c12;
}

.submission-actions button {
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
</style>