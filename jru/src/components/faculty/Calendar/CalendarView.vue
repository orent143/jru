<template>
  <div class="calendar-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="main-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <div class="calendar-content-wrapper">
        <div class="calendar-header">
          <div class="calendar-header-title">
          <h1>Academic Calendar</h1>
          <p class="calendar-subtitle">Plan, schedule, and manage your academic activities. Keep track of important dates, classes, exams, and events throughout the semester.</p>
        </div>
          <div class="current-date">
            <i class="pi pi-calendar"></i>
            <span>{{ formattedCurrentDate }}</span>
          </div>
        </div>

        <div class="scrollable-content">
          <div class="calendar-content">
            <div class="calendar-sidebar">
              <div class="date-info">
                <h3>Today's Date</h3>
                <div class="date-display">
                  <div class="day">{{ currentDay }}</div>
                  <div class="month-year">
                    <div class="month">{{ currentMonth }}</div>
                    <div class="year">{{ currentYear }}</div>
                  </div>
                </div>
              </div>

              <div class="quick-actions">
                <h3>Quick Actions</h3>
                <button class="action-btn" @click="addEvent">
                  <i class="pi pi-plus"></i> Add Event
                </button>
                <button class="action-btn" @click="viewSchedule">
                  <i class="pi pi-list"></i> View Schedule
                </button>
              </div>
            </div>

            <div class="calendar-main">
              <div class="calendar-controls">
                <button @click="previousMonth" class="nav-btn">
                  <i class="pi pi-chevron-left"></i>
                </button>
                <h3>{{ displayMonth }} {{ displayYear }}</h3>
                <button @click="nextMonth" class="nav-btn">
                  <i class="pi pi-chevron-right"></i>
                </button>
              </div>

              <div class="calendar-grid">
                <div class="calendar-weekdays">
                  <div v-for="day in weekDays" :key="day" class="weekday">{{ day }}</div>
                </div>
                <div class="calendar-days">
                  <div 
                    v-for="(day, index) in calendarDays" 
                    :key="index" 
                    class="calendar-day"
                    :class="{
                      'other-month': day.otherMonth,
                      'today': day.isToday,
                      'has-event': day.hasEvent
                    }"
                    @click="selectDate(day)"
                  >
                    <span class="day-number">{{ day.date }}</span>
                    <div v-if="day.hasEvent" class="event-indicator"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="showEventModal" class="modal">
        <div class="modal-content">
          <span class="close" @click="closeEventModal">&times;</span>
          <h2>{{ isEditingEvent ? 'Edit Event' : 'Add Event' }}</h2>
          
          <div class="form-group">
            <label for="event-title">Event Title</label>
            <input 
              v-model="eventForm.title" 
              type="text" 
              id="event-title" 
              placeholder="Enter event title"
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="event-date">Event Date</label>
            <input 
              v-model="eventForm.date" 
              type="date" 
              id="event-date" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="event-time">Event Time</label>
            <input 
              v-model="eventForm.time" 
              type="time" 
              id="event-time" 
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="event-description">Description</label>
            <textarea 
              v-model="eventForm.description" 
              id="event-description" 
              placeholder="Enter event description"
              class="form-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="event-type">Event Type</label>
            <select v-model="eventForm.type" id="event-type" class="form-control">
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div class="form-group">
            <label for="event-course">Course</label>
            <select v-model="eventForm.course_id" id="event-course" class="form-control">
              <option :value="null">General Event (No Course)</option>
              <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                {{ course.course_name }}
              </option>
            </select>
          </div>

          <button 
            class="submit-btn" 
            @click="saveEvent" 
            :disabled="isSubmitting"
          >
            {{ isEditingEvent ? 'Update Event' : 'Add Event' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/faculty/SideBar.vue';
import axios from "axios";
import { useToast } from 'vue-toastification';

export default {
  name: 'CalendarView',
  components: { 
    Header, 
    Sidebar 
  },
  data() {
    return {
      faculty: null,
      searchQuery: '',
      isSidebarCollapsed: false,
      courses: [],
      currentDate: new Date(),
      displayDate: new Date(),
      weekDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      events: [],
      showEventModal: false,
      isSubmitting: false,
      isEditingEvent: false,
      eventForm: {
        id: null,
        title: '',
        date: '',
        time: '',
        description: '',
        type: 'class',
        course_id: null
      }
    };
  },
  computed: {
    formattedCurrentDate() {
      return this.currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    currentDay() {
      return this.currentDate.getDate();
    },
    currentMonth() {
      return this.currentDate.toLocaleDateString('en-US', { month: 'long' });
    },
    currentYear() {
      return this.currentDate.getFullYear();
    },
    displayMonth() {
      return this.displayDate.toLocaleDateString('en-US', { month: 'long' });
    },
    displayYear() {
      return this.displayDate.getFullYear();
    },
    calendarDays() {
      const year = this.displayDate.getFullYear();
      const month = this.displayDate.getMonth();
      
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      const firstDayOfWeek = firstDay.getDay();
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      const days = [];
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevMonthLastDay - i;
        days.push({
          date,
          otherMonth: true,
          isToday: false,
          hasEvent: this.hasEventOnDate(new Date(year, month - 1, date))
        });
      }
      
      for (let i = 1; i <= lastDay.getDate(); i++) {
        const isToday = this.isToday(new Date(year, month, i));
        days.push({
          date: i,
          otherMonth: false,
          isToday,
          hasEvent: this.hasEventOnDate(new Date(year, month, i))
        });
      }
      
      const remainingDays = 42 - days.length; 
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          date: i,
          otherMonth: true,
          isToday: false,
          hasEvent: this.hasEventOnDate(new Date(year, month + 1, i))
        });
      }
      
      return days;
    }
  },
  mounted() {
    this.loadUserData();
    this.fetchCourses();
    this.fetchEvents();
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    hasEventOnDate(date) {
      return this.events.some(event => {
        const eventDate = new Date(event.date);
        return eventDate.getDate() === date.getDate() &&
               eventDate.getMonth() === date.getMonth() &&
               eventDate.getFullYear() === date.getFullYear();
      });
    },
    previousMonth() {
      this.displayDate = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth() - 1,
        1
      );
    },
    nextMonth() {
      this.displayDate = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth() + 1,
        1
      );
    },
    selectDate(day) {
      if (day.otherMonth) return;
      
      const selectedDate = new Date(
        this.displayDate.getFullYear(),
        this.displayDate.getMonth(),
        day.date
      );
      
      this.eventForm.date = this.formatDateForInput(selectedDate);
      this.showEventModal = true;
    },
    formatDateForInput(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    addEvent() {
      this.isEditingEvent = false;
      this.eventForm = {
        id: null,
        title: '',
        date: this.formatDateForInput(new Date()),
        time: '',
        description: '',
        type: 'class',
        course_id: null
      };
      this.showEventModal = true;
    },
    editEvent(event) {
      this.isEditingEvent = true;
      this.eventForm = { ...event };
      this.showEventModal = true;
    },
    closeEventModal() {
      this.showEventModal = false;
      this.eventForm = {
        id: null,
        title: '',
        date: '',
        time: '',
        description: '',
        type: 'class',
        course_id: null
      };
    },
    async saveEvent() {
      const toast = useToast();
      
      if (!this.eventForm.title || !this.eventForm.date) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      this.isSubmitting = true;
      
      try {
        if (this.isEditingEvent) {
          await axios.put(`http://127.0.0.1:8000/api/events/${this.eventForm.id}`, {
            ...this.eventForm,
            user_id: this.faculty.user_id
          });
          toast.success('Event updated successfully');
        } else {
          await axios.post('http://127.0.0.1:8000/api/events/', {
            ...this.eventForm,
            user_id: this.faculty.user_id
          });
          toast.success('Event added successfully');
        }
        
        await this.fetchEvents();
        this.closeEventModal();
      } catch (error) {
        console.error('Error saving event:', error);
        toast.error('Failed to save event');
      } finally {
        this.isSubmitting = false;
      }
    },
    async fetchEvents() {
      try {
        const response = await axios.get('http://127.0.0.1:8000/api/events/');
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Fetched ${response.data.length} events for calendar view`);
          this.events = response.data;
        } else {
          console.error('Unexpected response format:', response.data);
          this.events = [];
        }
        
        this.refreshCalendarView();
      } catch (error) {
        console.error('Error fetching events:', error);
        const toast = useToast();
        toast.error('Failed to load events. Please try refreshing the page.');
        this.events = [];
      }
    },
    refreshCalendarView() {
      this.displayDate = new Date(this.displayDate);
    },
    viewSchedule() {
      this.$router.push('/faculty/schedule');
    },
    loadUserData() {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.faculty = JSON.parse(userData);
      }
    },
    async fetchCourses() {
      try {
        if (!this.faculty || !this.faculty.user_id) {
          console.log('Faculty data not available yet');
          return;
        }
        
        const response = await axios.get(`http://127.0.0.1:8000/api/courses?user_id=${this.faculty.user_id}`);
        this.courses = response.data;
      } catch (error) {
        console.error('Error fetching courses:', error);
        const toast = useToast();
        toast.error('Failed to load courses');
      }
    }
  }
};
</script>

<style scoped>
.calendar-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
  overflow: hidden;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
  height: calc(100vh - 60px); /* Adjust based on header height */
}

.calendar-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.calendar-header {
  padding: 20px 20px 0;
  background-color: #fff;
  z-index: 10;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
.calendar-header-title {
  display: flex;
  flex-direction: column;
}
.calendar-header h1 {
  color: #2c3e50;
}

.calendar-subtitle {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 10px;
}

.current-date {
  display: flex;
  align-items: center;
  background-color: #007BF6;
  color: white;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 600;
}

.current-date i {
  margin-right: 10px;
  font-size: 18px;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px 20px;
  background-color: #fff;
  scrollbar-width: thin;
  scrollbar-color: #bcc3ce #f8f9fa;
}

.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: #f8f9fa;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: #bcc3ce;
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: #a0a8b5;
}

.calendar-content {
  display: flex;
  gap: 20px;
}

.calendar-sidebar {
  width: 300px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.date-info {
  margin-bottom: 30px;
}

.date-info h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.date-display {
  display: flex;
  align-items: center;
}

.day {
  font-size: 48px;
  font-weight: 700;
  color: #007BF6;
  margin-right: 10px;
}

.month-year {
  display: flex;
  flex-direction: column;
}

.month {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.year {
  font-size: 14px;
  color: #6c757d;
}

.quick-actions {
  margin-top: 30px;
}

.quick-actions h3 {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 15px;
}

.action-btn {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 10px;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  color: #2c3e50;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn i {
  margin-right: 10px;
  color: #007BF6;
}

.action-btn:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.calendar-main {
  flex: 1;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-controls h3 {
  font-size: 20px;
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #007BF6;
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.nav-btn:hover {
  background-color: #f0f0f0;
}

.calendar-grid {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.weekday {
  padding: 10px;
  text-align: center;
  font-weight: 600;
  color: #6c757d;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(6, 1fr);
}

.calendar-day {
  position: relative;
  height: 100px;
  padding: 10px;
  border-right: 1px solid #e9ecef;
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  transition: background-color 0.3s;
}

.calendar-day:hover {
  background-color: #f8f9fa;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.day-number {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
}

.other-month .day-number {
  color: #adb5bd;
}

.today {
  background-color: #e6f2ff;
}

.today .day-number {
  background-color: #007BF6;
  color: white;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.event-indicator {
  position: absolute;
  bottom: 5px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  background-color: #007BF6;
  border-radius: 50%;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  width: 400px;
  position: relative;
}

.modal-content h2 {
  font-size: 25px;
  font-weight: bold;
  color: #000;
  margin-bottom: 15px;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000;
  font-size: 25px;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #007BF6;
  box-shadow: 0 0 0 2px rgba(0, 123, 246, 0.2);
}

.submit-btn {
  padding: 10px 20px;
  background-color: #007BF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s;
  width: 100%;
  display: flex;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background-color: #004285;
}

.submit-btn:disabled {
  background-color: #a8d5ae;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .calendar-content {
    flex-direction: column;
  }
  
  .calendar-sidebar {
    width: 100%;
  }
  
  .calendar-day {
    height: 80px;
  }
}
</style> 