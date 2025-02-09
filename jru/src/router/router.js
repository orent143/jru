import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import StudentDashboard from '@/views/student/StudentDashboard.vue';
import CourseContent from '@/components/student/course/CourseContent.vue'; 
import AssignmentDetailsVue from '@/components/student/assignment/AssignmentDetails.vue';
import CourseMaterialDetail from '@/components/student/course/CourseMaterialDetail.vue';
import AssignmentDashboard from '@/views/student/Assignment.vue';
import AssignmentContent from '@/components/student/assignment/AssignmentContent.vue';
import ExamDashboard from '@/views/student/Exam.vue';
import ExamContent from '@/components/student/exam/ExamContent.vue';
import ExamDetails from '@/components/student/exam/ExamDetails.vue';
import QuizDashboard from '@/views/student/Quiz.vue';
import QuizContent from '@/components/student/quiz/QuizContent.vue';
import QuizDetails from '@/components/student/quiz/QuizDetails.vue';
import GradeDashboard from '@/views/student/Grades.vue';

import FacultyDashboard from '@/views/faculty/FacultyDashboard.vue';
import FacultyCourse from '@/views/faculty/Courses.vue';
import FacultyCourseContent from '@/components/faculty/Course/coursescontent.vue';
import FacultyCourseMaterialDetail from '@/components/faculty/Course/FacultyCourseMaterial.vue';
import StudentList from '@/components/faculty/Course/StudentList.vue';
import FacultyQuiz from '@/views/faculty/FacultyQuiz.vue';
import FacultyExam from '@/views/faculty/FacultyExam.vue';
import FacultyAssignment from '@/views/faculty/FacultyAssignment.vue';
import FacultyAssignmentContent from '@/components/faculty/Assignment/FacultyAssContent.vue';
import FacultyAssignmentDetailsVue from '@/components/faculty/Assignment/FacultyAssignmentDetails.vue';
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
  {
    path: '/course/:courseId/material/:materialId',
    name: 'FacultyCourseMaterialDetail',
    component: FacultyCourseMaterialDetail,
    props: true,
  },
  {
    path: '/course/:courseId/students',  // Add this new route
    name: 'StudentList',
    component: StudentList,
    props: true
  },
  {
    path: '/faculty-quizzes',
    name: 'FacultyQuiz',
    component: FacultyQuiz,
  },
  {
    path: '/faculty-exams',
    name: 'FacultyExam',
    component: FacultyExam,
  },
  {
    path: '/faculty-assignments',
    name: 'FacultyAssignment',
    component: FacultyAssignment,
  },
  {
    path: '/course/:courseId',
    name: 'FacultyAssignmentContent',
    component: FacultyAssignmentContent,
    props: true,
  },
  {
    path: '/course/:courseId/assignment/:assignmentId',
    name: 'FacultyAssignmentDetails',
    component: FacultyAssignmentDetailsVue,
    props: true,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;