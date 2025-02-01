import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/views/LandingPage.vue';
import StudentDashboard from '@/views/StudentDashboard.vue';
import CourseContent from '@/components/student/CourseContent.vue'; 
import AssignmentDetailsVue from '@/components/student/AssignmentDetails.vue';
import CourseMaterialDetail from '@/components/student/CourseMaterialDetail.vue';
import AssignmentDashboard from '@/views/Assignment.vue';
import AssignmentContent from '@/components/student/AssignmentContent.vue'; // ✅ Import fixed

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
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
