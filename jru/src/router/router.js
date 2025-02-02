import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import StudentDashboard from '@/views/student/StudentDashboard.vue';
import CourseContent from '@/components/student/CourseContent.vue'; 
import AssignmentDetailsVue from '@/components/student/AssignmentDetails.vue';
import CourseMaterialDetail from '@/components/student/CourseMaterialDetail.vue';
import AssignmentDashboard from '@/views/student/Assignment.vue';
import AssignmentContent from '@/components/student/AssignmentContent.vue';
import ExamDashboard from '@/views/student/Exam.vue';
import ExamContent from '@/components/student/ExamContent.vue';
import ExamDetails from '@/components/student/ExamDetails.vue';
import QuizDashboard from '@/views/student/Quiz.vue' // Import the new component
import QuizContent from '@/components/student/QuizContent.vue' // Import the new component
import QuizDetails from '@/components/student/QuizDetails.vue' // Import the new component
import GradeDashboard from '@/views/student/Grades.vue' // Import the new component

import FacultyDashboard from '@/views/faculty/FacultyDashboard.vue';
import FacultyCourse from '@/views/faculty/Courses.vue';
import FacultyCourseContent from '@/components/faculty/coursescontent.vue';

const routes = [
  {
    path: '/',
    name: 'LandingPage',
    component: LandingPage,
  },
  {
    path: '/student-dashboard',
    name: 'StudentDashboard',
    component: StudentDashboard,
  },
  {
    path: '/course/:courseId/material/:materialId',
    name: 'MaterialDetail',
    component: CourseMaterialDetail,
  },
  {
    path: '/course/:courseId',
    name: 'CourseContent',
    component: CourseContent,
    props: true,
  },
  {
    path: '/course/:courseId/assignment/:assignmentId',
    name: 'AssignmentDetails',
    component: AssignmentDetailsVue,
    props: true,
  },
  {
    path: '/assignment-content',
    name: 'AssignmentDashboard',
    component: AssignmentDashboard,
  },
  {
    path: '/course/:courseId/assignments',
    name: 'AssignmentContent',
    component: AssignmentContent,
    props: true,
  },
  {
    path: '/exam-dashboard',
    name: 'ExamDashboard',
    component: ExamDashboard,
  },
  {
    path: '/course/:courseId/exams',
    name: 'ExamContent',
    component: ExamContent,
    props: true,
  },
  {
    path: '/course/:courseId/exam/:examId',
    name: 'ExamDetails',
    component: ExamDetails,
    props: true,
  },
  {
    path: '/quiz-dashboard',
    name: 'QuizDashboard',
    component: QuizDashboard,
  },
  {
    path: '/course/:courseId/quizzes',
    name: 'QuizContent',
    component: QuizContent,
    props: true,
  },
  {
    path: '/course/:courseId/quiz/:quizId',
    name: 'QuizDetails',
    component: QuizDetails,
    props: true,
  },
  {
    path: '/grade-dashboard',
    name: 'GradeDashboard',
    component: GradeDashboard,
  },

/* Faculty Routes */
  {
    path: '/faculty-dashboard',
    name: 'FacultyDashboard',
    component: FacultyDashboard,
  },
  {
    path: '/faculty-courses',
    name: 'FacultyCourse',
    component: FacultyCourse,
  },
  {
    path: '/course/:courseId',
    name: 'FacultyCourseContent',
    component: FacultyCourseContent,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;