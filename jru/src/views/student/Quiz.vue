<template>
    <div class="quiz-container">
        <Header :student="student" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
        <div class="quiz-content">
            <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />
            <main class="quiz-main">
                <!-- Header for Quizzes -->
                <div class="course-header">
                    <h2>Quizzes: <span>{{ totalQuizzes }}</span></h2>
                    
                    <!-- Course Sections -->
                    <div class="course-sections">
                        <ul>
                            <li v-for="section in courses[0].sections" :key="section.id">
                                {{ section.name }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="course-cards">
                    <!-- Looping through courses -->
                    <div 
                        class="course-card" 
                        v-for="course in courses" 
                        :key="course.id" 
                        @click="navigateToQuizzes(course.id)" 
                        :class="{ 'has-quizzes': course.quizzes.length > 0 }"
                    >
                        <div class="course-info">
                            <i class="pi pi-file-edit course-logo"></i>
                            <h4 class="course-name">{{ course.name }}</h4>
                        </div>

                        <!-- Display first quiz -->
                        <div class="quizzes-list" v-if="course.quizzes.length > 0">
                            <ul>
                                <li 
                                    @click.stop="navigateToQuizDetail(course.id, course.quizzes[0].id)"
                                >
                                    <span class="quiz-name">{{ course.quizzes[0].name }}</span>
                                    <span class="quiz-date">Date: {{ course.quizzes[0].date }}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>

<script>
import Header from '@/components/student/Header.vue';
import Sidebar from '@/components/student/Sidebar.vue';

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
                    quizzes: [
                        { id: 1, name: 'Quiz 1', date: '2024-03-01' },
                        { id: 2, name: 'Quiz 2', date: '2024-05-01' }
                    ]
                },
                {
                    id: 2,
                    name: 'GEC010',
                    sections: [{ id: 1, name: 'BSCS-3A' }],
                    quizzes: [
                        { id: 1, name: 'Quiz 1', date: '2024-03-10' }
                    ]
                },
                {
                    id: 3,
                    name: "CC321",
                    quizzes: [
                        { id: 1, name: "Quiz 1", date: "2024-03-15" },
                    ],
                },
            ],
            searchQuery: '',
            isSidebarCollapsed: false,
        };
    },
    computed: {
        totalQuizzes() {
            return this.courses.reduce((total, course) => total + course.quizzes.length, 0);
        }
    },
    methods: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed;
        },

        navigateToQuizzes(courseId) {
            // Navigate to the QuizContent page for the selected course
            this.$router.push({
                name: 'QuizContent', 
                params: { courseId: courseId.toString() }
            });
        },

        navigateToQuizDetail(courseId, quizId) {
            // Navigate to the quiz details page
            this.$router.push({
                name: 'QuizDetails', 
                params: { courseId: courseId.toString(), quizId: quizId.toString() }
            });
        }
    }
};
</script>

<style scoped>
.quiz-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.quiz-content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.quiz-main {
    flex: 1;
    padding: 2rem;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
}

.course-header {
    background-color: #D9D9D9;
    padding: 1rem;
    border-radius: 10px;
    margin-bottom: 2rem;
}

.course-header h2 {
    font-size: 24px;
    font-weight: bold;
    color: #000000;
}

.course-sections ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.course-sections li {
    font-size: 1rem;
    color: #555;
}

.course-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 4rem;
}

.course-card {
    background-color: #D9D9D9ff;
    border-radius: 20px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    padding: 20px;
    height: auto;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.course-card:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.course-card.has-quizzes {
    background-color: #007BF6;
    color: #ffffff;
}

.course-info {
    display: flex;
    align-items: center;
    gap: 10px;
}

.course-logo {
    font-size: 20px;
    color: inherit;
}

.course-card:not(.has-quizzes) .course-name {
    color: black;
}

.course-card:not(.has-quizzes) .course-logo {
    color: black;
}

.course-name {
    font-size: 20px;
    font-weight: 650;
}

.quizzes-list {
    margin-top: 1rem;
}

.quizzes-list ul {
    list-style-type: none;
    padding-left: 0;
    margin: 0;
}

.quiz-name {
    font-size: 1rem;
    font-weight: bold;
}

.quiz-date {
    font-size: 0.9rem;
    color: #888;
}
</style>