<template>
  <div class="schedule-container">
    <Header :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    <div class="main-content">
      <Sidebar :isCollapsed="isSidebarCollapsed" :courses="courses" />

      <div class="schedule-content-wrapper">
        <div class="schedule-header">
          <h1>Schedule View</h1>
          <div class="current-date">
            <i class="pi pi-calendar"></i>
            <span>{{ formattedCurrentDate }}</span>
          </div>
        </div>

        <div class="schedule-controls">
          <button @click="previousWeek" class="nav-btn">
            <i class="pi pi-chevron-left"></i> Previous Week
          </button>
          <h3>{{ weekRangeDisplay }}</h3>
          <button @click="nextWeek" class="nav-btn">
            Next Week <i class="pi pi-chevron-right"></i>
          </button>
        </div>

        <div class="schedule-filters">
          <div class="filter-group">
            <label for="filter-course">Course:</label>
            <select id="filter-course" v-model="selectedCourse" class="filter-select">
              <option :value="null">All Courses</option>
              <option v-for="course in courses" :key="course.course_id" :value="course.course_id">
                {{ course.course_name }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label for="filter-type">Event Type:</label>
            <select id="filter-type" v-model="selectedType" class="filter-select">
              <option value="all">All Types</option>
              <option value="class">Class</option>
              <option value="exam">Exam</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
              <option value="meeting">Meeting</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="back-to-calendar">
          <button @click="backToCalendar" class="back-btn">
            <i class="pi pi-calendar"></i> Back to Calendar
          </button>
        </div>
        </div>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading events...</p>
        </div>

        <div v-else class="schedule-grid">
          <!-- Week Day Headers -->
          <div class="schedule-weekdays">
            <div class="time-column"></div>
            <div v-for="(day, index) in weekDays" :key="index" class="weekday-column">
              <div class="weekday-header" :class="{ 'today': isToday(day.date) }">
                <div class="weekday-name">{{ day.name }}</div>
                <div class="weekday-date">{{ formatDate(day.date) }}</div>
              </div>
            </div>
          </div>

          <!-- Schedule Time Grid -->
          <div class="schedule-times">
            <div class="time-slots">
              <div v-for="hour in timeSlots" :key="hour" class="time-slot">
                {{ formatHour(hour) }}
              </div>
            </div>

            <!-- Day Columns -->
            <div v-for="(day, dayIndex) in weekDays" :key="dayIndex" class="day-column">
              <!-- All day events for this day -->
              <div class="all-day-events">
                <div 
                  v-for="event in getAllDayEventsForDate(day.date)" 
                  :key="event.event_id"
                  class="all-day-event"
                  :class="event.type"
                  @click="viewEventDetails(event)"
                >
                  <div class="event-title">{{ event.title }}</div>
                </div>
              </div>
              
              <div 
                v-for="hour in timeSlots" 
                :key="`${dayIndex}-${hour}`" 
                class="hour-cell"
              >
                <!-- Events in this time slot -->
                <div 
                  v-for="event in getEventsForTimeSlot(day.date, hour)" 
                  :key="event.event_id"
                  class="event-block"
                  :class="event.type"
                  @click="viewEventDetails(event)"
                  :style="getEventStyle(event, hour)"
                >
                  <div class="event-time">{{ formatEventTime(event.time) }}</div>
                  <div class="event-title">{{ event.title }}</div>
                  <div v-if="event.course_name" class="event-course">{{ event.course_name }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Event Details Modal -->
    <div v-if="showEventDetailsModal" class="modal">
      <div class="modal-content">
        <span class="close" @click="closeEventDetailsModal">&times;</span>
        <h2>Event Details</h2>
        
        <div v-if="selectedEvent" class="event-details">
          <div class="event-detail-header">
            <h3>{{ selectedEvent.title }}</h3>
            <span class="event-type-badge" :class="selectedEvent.type">
              {{ formatEventType(selectedEvent.type) }}
            </span>
          </div>
          
          <div class="detail-row">
            <i class="pi pi-calendar"></i>
            <span>{{ formatFullDate(selectedEvent.date) }}</span>
          </div>
          
          <div class="detail-row" v-if="selectedEvent.time">
            <i class="pi pi-clock"></i>
            <span>{{ formatEventTime(selectedEvent.time) }}</span>
          </div>
          
          <div class="detail-row" v-if="selectedEvent.course_name">
            <i class="pi pi-book"></i>
            <span>{{ selectedEvent.course_name }}</span>
          </div>
          
          <div class="event-description" v-if="selectedEvent.description">
            <h4>Description:</h4>
            <p>{{ selectedEvent.description }}</p>
          </div>
          
          <div class="detail-row">
            <i class="pi pi-user"></i>
            <span>Posted by: {{ selectedEvent.user_name }}</span>
          </div>
          
          <div class="event-actions">
            <button @click="editEvent" class="edit-btn">
              <i class="pi pi-pencil"></i> Edit
            </button>
            <button @click="deleteEvent" class="delete-btn">
              <i class="pi pi-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Header from '@/components/header.vue';
import Sidebar from '@/components/faculty/SideBar.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';

export default {
  name: 'ScheduleView',
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
      events: [],
      currentDate: new Date(),
      weekStartDate: null,
      timeSlots: Array.from({ length: 14 }, (_, i) => i + 7), // 7 AM to 8 PM
      selectedCourse: null,
      selectedType: 'all',
      weekDays: [],
      showEventDetailsModal: false,
      selectedEvent: null,
      isLoading: false
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
    weekRangeDisplay() {
      if (!this.weekStartDate) return '';
      
      const weekEndDate = new Date(this.weekStartDate);
      weekEndDate.setDate(weekEndDate.getDate() + 6);
      
      const startMonth = this.weekStartDate.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = weekEndDate.toLocaleDateString('en-US', { month: 'short' });
      
      const startDay = this.weekStartDate.getDate();
      const endDay = weekEndDate.getDate();
      
      const startYear = this.weekStartDate.getFullYear();
      const endYear = weekEndDate.getFullYear();
      
      if (startYear !== endYear) {
        return `${startMonth} ${startDay}, ${startYear} - ${endMonth} ${endDay}, ${endYear}`;
      } else if (startMonth !== endMonth) {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${startYear}`;
      } else {
        return `${startMonth} ${startDay} - ${endDay}, ${startYear}`;
      }
    },
    filteredEvents() {
      let filtered = this.events;
      
      if (this.selectedCourse) {
        filtered = filtered.filter(event => event.course_id === this.selectedCourse);
      }
      
      if (this.selectedType !== 'all') {
        filtered = filtered.filter(event => event.type === this.selectedType);
      }
      
      return filtered;
    }
  },
  watch: {
    selectedCourse() {
      // Re-render schedule when filter changes
    },
    selectedType() {
      // Re-render schedule when filter changes
    }
  },
  mounted() {
    this.loadUserData();
    this.fetchCourses();
    this.initializeWeek();
    this.fetchEvents();
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    initializeWeek() {
      const today = new Date();
      // Set to the beginning of the current week (Sunday)
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek;
      this.weekStartDate = new Date(today.setDate(diff));
      
      // Generate the week days
      this.generateWeekDays();
    },
    generateWeekDays() {
      this.weekDays = [];
      const currentWeekStartDate = new Date(this.weekStartDate);
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStartDate);
        date.setDate(date.getDate() + i);
        
        this.weekDays.push({
          name: date.toLocaleDateString('en-US', { weekday: 'short' }),
          date: new Date(date)
        });
      }
      
      // Log info about events in the current week for debugging
      const weekStart = new Date(this.weekStartDate);
      const weekEnd = new Date(this.weekStartDate);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      console.log(`Week range: ${weekStart.toDateString()} to ${weekEnd.toDateString()}`);
      const eventsThisWeek = this.events.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= weekStart && eventDate <= weekEnd;
      });
      
      console.log(`Events in current week: ${eventsThisWeek.length}`);
    },
    previousWeek() {
      this.weekStartDate.setDate(this.weekStartDate.getDate() - 7);
      this.generateWeekDays();
    },
    nextWeek() {
      this.weekStartDate.setDate(this.weekStartDate.getDate() + 7);
      this.generateWeekDays();
    },
    isToday(date) {
      const today = new Date();
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear();
    },
    formatDate(date) {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric'
      });
    },
    formatFullDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    },
    formatHour(hour) {
      return hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`;
    },
    formatEventTime(timeString) {
      if (!timeString || typeof timeString !== 'string') return '';
      
      try {
        // Parse the time (e.g., "14:30:00" to "2:30 PM")
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const minute = parseInt(minutes, 10);
        
        // Check if the parsing was successful
        if (isNaN(hour) || isNaN(minute)) return timeString;
        
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        
        return `${formattedHour}:${minute.toString().padStart(2, '0')} ${period}`;
      } catch (error) {
        console.error('Error formatting time:', error);
        return timeString; // Return the original string if formatting fails
      }
    },
    formatEventType(type) {
      const typeMap = {
        'class': 'Class',
        'exam': 'Exam',
        'quiz': 'Quiz',
        'assignment': 'Assignment',
        'meeting': 'Meeting',
        'other': 'Other'
      };
      
      return typeMap[type] || type;
    },
    getEventsForTimeSlot(date, hour) {
      return this.filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        
        // Check if event is on this day
        if (
          eventDate.getDate() !== date.getDate() ||
          eventDate.getMonth() !== date.getMonth() ||
          eventDate.getFullYear() !== date.getFullYear()
        ) {
          return false;
        }
        
        // If event has no time or time is not a string, return false
        if (!event.time || typeof event.time !== 'string') return false;
        
        // Get event hour
        const [eventHour] = event.time.split(':').map(Number);
        
        // Check if event is in this hour slot
        return eventHour === hour;
      });
    },
    getEventStyle(event, hour) {
      // Calculate event duration - default to 1 hour if not specified
      const durationHours = 1;
      
      return {
        height: `${durationHours * 100}%`,
        top: '0%'
      };
    },
    viewEventDetails(event) {
      this.selectedEvent = event;
      this.showEventDetailsModal = true;
    },
    closeEventDetailsModal() {
      this.showEventDetailsModal = false;
      this.selectedEvent = null;
    },
    editEvent() {
      // Navigate to calendar view with the event to edit
      this.$router.push({
        path: '/faculty/calendar',
        query: { editEvent: this.selectedEvent.event_id }
      });
    },
    async deleteEvent() {
      if (!this.selectedEvent) return;
      
      const toast = useToast();
      
      try {
        await axios.delete(`http://127.0.0.1:8000/api/events/${this.selectedEvent.event_id}`);
        toast.success('Event deleted successfully');
        this.closeEventDetailsModal();
        this.fetchEvents();
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error('Failed to delete event');
      }
    },
    backToCalendar() {
      this.$router.push('/faculty/calendar');
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
    },
    async fetchEvents() {
      this.isLoading = true;
      
      try {
        // Fetch all events instead of user-specific ones
        const response = await axios.get('http://127.0.0.1:8000/api/events/');
        
        if (response.data && Array.isArray(response.data)) {
          console.log(`Fetched ${response.data.length} events`);
          this.events = response.data;
        } else {
          console.error('Unexpected response format:', response.data);
          this.events = [];
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        const toast = useToast();
        toast.error('Failed to load events. Please try refreshing the page.');
        this.events = [];
      } finally {
        this.isLoading = false;
      }
    },
    getAllDayEventsForDate(date) {
      return this.filteredEvents.filter(event => {
        const eventDate = new Date(event.date);
        
        // Check if event is on this day
        if (
          eventDate.getDate() !== date.getDate() ||
          eventDate.getMonth() !== date.getMonth() ||
          eventDate.getFullYear() !== date.getFullYear()
        ) {
          return false;
        }
        
        // Return events that don't have a time or time is not a string
        return !event.time || typeof event.time !== 'string';
      });
    }
  }
};
</script>

<style scoped>
.schedule-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f9fa;
}

.main-content {
  display: flex;
  flex: 1;
  position: relative;
}

.schedule-content-wrapper {
  flex: 1;
  padding: 20px;
  transition: margin-left 0.3s ease;
}

.schedule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.schedule-header h1 {
  color: #000;
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

.schedule-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.schedule-controls h3 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
}

.nav-btn {
  display: flex;
  align-items: center;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: #e9ecef;
}

.nav-btn i {
  margin-right: 5px;
}

.nav-btn i:last-child {
  margin-right: 0;
  margin-left: 5px;
}

.schedule-filters {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  background-color: white;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
}

.filter-group label {
  margin-right: 10px;
  font-weight: 600;
  color: #2c3e50;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  color: #2c3e50;
  width: 200px;
}

.schedule-grid {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  height: 600px; /* Set a fixed height for the grid */
}

.schedule-weekdays {
  display: flex;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 2;
  background-color: white;
}

.time-column {
  width: 80px;
  border-right: 1px solid #e9ecef;
}

.weekday-column {
  flex: 1;
  text-align: center;
}

.weekday-header {
  padding: 15px 10px;
  border-right: 1px solid #e9ecef;
}

.weekday-column:last-child .weekday-header {
  border-right: none;
}

.weekday-header.today {
  background-color: #e6f2ff;
}

.weekday-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
}

.weekday-date {
  font-size: 14px;
  color: #6c757d;
}

.schedule-times {
  display: flex;
  overflow-y: auto;
  flex: 1;
  position: relative;
  scrollbar-width: thin;
}

.schedule-times::-webkit-scrollbar {
  width: 8px;
}

.schedule-times::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.schedule-times::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.schedule-times::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

.time-slots {
  width: 80px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9ecef;
  position: sticky;
  left: 0;
  z-index: 1;
  background-color: white;
}

.time-slot {
  height: 60px;
  padding: 5px;
  border-bottom: 1px solid #e9ecef;
  font-size: 12px;
  color: #6c757d;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.day-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e9ecef;
  position: relative;
}

.day-column:last-child {
  border-right: none;
}

.all-day-events {
  margin-bottom: 5px;
  padding: 2px;
  min-height: 30px;
  border-bottom: 1px dashed #e9ecef;
  position: sticky;
  top: 0;
  background-color: white;
  z-index: 1;
}

.hour-cell {
  height: 60px;
  border-bottom: 1px solid #e9ecef;
  position: relative;
  box-sizing: border-box;
}

.event-block {
  position: absolute;
  left: 5px;
  right: 5px;
  background-color: #e6f2ff;
  border-left: 4px solid #007BF6;
  border-radius: 4px;
  padding: 5px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
  z-index: 1;
}

.event-block:hover {
  transform: scale(1.02);
  z-index: 2;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.event-block.class {
  background-color: #e6f2ff;
  border-left-color: #007BF6;
}

.event-block.exam {
  background-color: #ffe6e6;
  border-left-color: #dc3545;
}

.event-block.quiz {
  background-color: #fff3e6;
  border-left-color: #fd7e14;
}

.event-block.assignment {
  background-color: #e6ffe6;
  border-left-color: #28a745;
}

.event-block.meeting {
  background-color: #f0e6ff;
  border-left-color: #6610f2;
}

.event-block.other {
  background-color: #f8f9fa;
  border-left-color: #6c757d;
}

.event-time {
  font-size: 12px;
  color: #6c757d;
}

.event-title {
  color: #333;
  font-weight: 600;
  font-size: 14px;
  margin: 2px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-course {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.back-to-calendar {
  margin-left: auto;
}

.back-btn {
  display: flex;
  align-items: center;
  background-color: #007BF6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.back-btn:hover {
  background-color: #0069d9;
}

.back-btn i {
  margin-right: 10px;
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
  width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
}

.modal-content h2 {
  font-size: 22px;
  font-weight: bold;
  color: #000;
  margin-bottom: 20px;
  text-align: center;
}

.close {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  color: #000;
  font-size: 25px;
}

.event-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.event-detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.event-detail-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
}

.event-type-badge {
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background-color: #007BF6;
  color: white;
}

.event-type-badge.class {
  background-color: #007BF6;
}

.event-type-badge.exam {
  background-color: #dc3545;
}

.event-type-badge.quiz {
  background-color: #fd7e14;
}

.event-type-badge.assignment {
  background-color: #28a745;
}

.event-type-badge.meeting {
  background-color: #6610f2;
}

.event-type-badge.other {
  background-color: #6c757d;
}

.detail-row {
  display: flex;
  align-items: center;
  color: #2c3e50;
}

.detail-row i {
  margin-right: 10px;
  color: #007BF6;
  width: 20px;
}

.event-description {
  margin-top: 10px;
}

.event-description h4 {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 5px;
}

.event-description p {
  color: #2c3e50;
  line-height: 1.5;
}

.event-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.edit-btn, .delete-btn {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.edit-btn {
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
  color: #2c3e50;
}

.edit-btn:hover {
  background-color: #e9ecef;
}

.delete-btn {
  background-color: #dc3545;
  border: none;
  color: white;
}

.delete-btn:hover {
  background-color: #c82333;
}

.edit-btn i, .delete-btn i {
  margin-right: 5px;
}

@media (max-width: 768px) {
  .schedule-filters {
    flex-direction: column;
    gap: 10px;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .time-column {
    width: 60px;
  }
  
  .time-slots {
    width: 60px;
  }
  
  .schedule-grid {
    height: 500px; /* Smaller height on mobile */
    overflow-x: auto; /* Allow horizontal scrolling on mobile */
  }
  
  .schedule-times {
    min-width: 650px; /* Ensure minimum width to prevent squishing */
  }
  
  .schedule-scroll-hint {
    margin-bottom: 10px;
  }
}

/* Add loading spinner styles */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BF6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.all-day-events {
  margin-bottom: 5px;
  padding: 2px;
  min-height: 30px;
  border-bottom: 1px dashed #e9ecef;
}

.all-day-event {
  margin: 2px 0;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
  background-color: #e6f2ff;
  border-left: 4px solid #007BF6;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.all-day-event.class {
  background-color: #e6f2ff;
  border-left-color: #007BF6;
}

.all-day-event.exam {
  background-color: #ffe6e6;
  border-left-color: #dc3545;
}

.all-day-event.quiz {
  background-color: #fff3e6;
  border-left-color: #fd7e14;
}

.all-day-event.assignment {
  background-color: #e6ffe6;
  border-left-color: #28a745;
}

.all-day-event.meeting {
  background-color: #f0e6ff;
  border-left-color: #6610f2;
}

.all-day-event.other {
  background-color: #f8f9fa;
  border-left-color: #6c757d;
}

/* Add a heading to inform users they can scroll */
.schedule-scroll-hint {
  text-align: center;
  margin-top: 10px;
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
}
</style> 