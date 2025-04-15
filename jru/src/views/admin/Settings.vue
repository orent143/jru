<template>
  <div class="dashboard-container">
    <Header :user="user" :searchQuery="searchQuery" @toggleSidebar="toggleSidebar" />
    
    <div class="dashboard-content">
      <SideBar :isCollapsed="isSidebarCollapsed" />
      
      <main class="dashboard-main">
        <div class="page-info">
          <h1 class="page-title">System Settings</h1>
          <p class="page-description">  Configure and customize platform-wide settings, including user policies, system behavior, course parameters, and visual appearance.
          </p>
          </div>
        
        <div class="settings-tabs">
          <div 
            v-for="tab in tabs" 
            :key="tab.id" 
            class="tab-item" 
            :class="{ 'active': activeTab === tab.id }"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </div>
        </div>
        
        <div v-if="isSaving" class="loading-overlay">
          <div class="loading-spinner"></div>
          <p>Saving changes...</p>
        </div>
        
        <!-- General Settings -->
        <div v-if="activeTab === 'general'" class="settings-panel">
          <h2>General Settings</h2>
          
          <div class="setting-group">
            <label for="site-name">Site Name</label>
            <input id="site-name" type="text" v-model="generalSettings.siteName" />
          </div>
          
          <div class="setting-group">
            <label for="site-desc">Site Description</label>
            <textarea id="site-desc" v-model="generalSettings.siteDescription"></textarea>
          </div>
          
          <div class="setting-group">
            <label for="timezone">Default Timezone</label>
            <select id="timezone" v-model="generalSettings.timezone">
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time (US & Canada)</option>
              <option value="America/Chicago">Central Time (US & Canada)</option>
              <option value="America/Denver">Mountain Time (US & Canada)</option>
              <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              <option value="Asia/Manila">Manila</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="date-format">Date Format</label>
            <select id="date-format" v-model="generalSettings.dateFormat">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="maintenance">Maintenance Mode</label>
            <div class="toggle-switch">
              <input type="checkbox" id="maintenance" v-model="generalSettings.maintenanceMode" />
              <label for="maintenance"></label>
            </div>
          </div>
        </div>
        
        <!-- User Settings -->
        <div v-if="activeTab === 'user'" class="settings-panel">
          <h2>User Settings</h2>
          
          <div class="setting-group">
            <label for="allow-registration">Allow New Registrations</label>
            <div class="toggle-switch">
              <input type="checkbox" id="allow-registration" v-model="userSettings.allowRegistration" />
              <label for="allow-registration"></label>
            </div>
          </div>
          
          <div class="setting-group">
            <label for="default-role">Default User Role</label>
            <select id="default-role" v-model="userSettings.defaultRole">
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="staff">Staff</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="password-policy">Password Policy</label>
            <select id="password-policy" v-model="userSettings.passwordPolicy">
              <option value="basic">Basic (minimum 8 characters)</option>
              <option value="medium">Medium (8 chars, 1 uppercase, 1 number)</option>
              <option value="strong">Strong (8 chars, uppercase, number, symbol)</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="session-timeout">Session Timeout (minutes)</label>
            <input id="session-timeout" type="number" v-model="userSettings.sessionTimeout" min="5" max="180" />
          </div>
          
          <div class="setting-group">
            <label for="two-factor">Require Two-Factor Authentication</label>
            <div class="toggle-switch">
              <input type="checkbox" id="two-factor" v-model="userSettings.twoFactorAuth" />
              <label for="two-factor"></label>
            </div>
          </div>
        </div>
        
        <!-- Course Settings -->
        <div v-if="activeTab === 'course'" class="settings-panel">
          <h2>Course Settings</h2>
          
          <div class="setting-group">
            <label for="academic-year">Current Academic Year</label>
            <input id="academic-year" type="text" v-model="courseSettings.academicYear" />
          </div>
          
          <div class="setting-group">
            <label for="semester">Current Semester</label>
            <select id="semester" v-model="courseSettings.semester">
              <option value="first">First Semester</option>
              <option value="second">Second Semester</option>
              <option value="summer">Summer</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="max-enrollment">Maximum Students per Course</label>
            <input id="max-enrollment" type="number" v-model="courseSettings.maxEnrollment" min="1" max="500" />
          </div>
          
          <div class="setting-group">
            <label for="auto-archive">Auto-Archive Courses After</label>
            <select id="auto-archive" v-model="courseSettings.autoArchive">
              <option value="never">Never</option>
              <option value="semester">End of Semester</option>
              <option value="year">End of Academic Year</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="enable-waitlist">Enable Course Waitlist</label>
            <div class="toggle-switch">
              <input type="checkbox" id="enable-waitlist" v-model="courseSettings.enableWaitlist" />
              <label for="enable-waitlist"></label>
            </div>
          </div>
        </div>
        
        <!-- Email Settings -->
        <div v-if="activeTab === 'email'" class="settings-panel">
          <h2>Email Settings</h2>
          
          <div class="setting-group">
            <label for="from-email">From Email Address</label>
            <input id="from-email" type="email" v-model="emailSettings.fromEmail" />
          </div>
          
          <div class="setting-group">
            <label for="from-name">From Name</label>
            <input id="from-name" type="text" v-model="emailSettings.fromName" />
          </div>
          
          <div class="setting-group">
            <label for="smtp-host">SMTP Host</label>
            <input id="smtp-host" type="text" v-model="emailSettings.smtpHost" />
          </div>
          
          <div class="setting-group">
            <label for="smtp-port">SMTP Port</label>
            <input id="smtp-port" type="number" v-model="emailSettings.smtpPort" />
          </div>
          
          <div class="setting-group">
            <label for="smtp-encryption">Encryption</label>
            <select id="smtp-encryption" v-model="emailSettings.encryption">
              <option value="none">None</option>
              <option value="ssl">SSL</option>
              <option value="tls">TLS</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="smtp-user">SMTP Username</label>
            <input id="smtp-user" type="text" v-model="emailSettings.username" />
          </div>
          
          <div class="setting-group">
            <label for="smtp-pass">SMTP Password</label>
            <input id="smtp-pass" type="password" v-model="emailSettings.password" />
          </div>
          
          <button class="test-btn" @click="testEmail">Test Email Configuration</button>
        </div>
        
        <!-- Appearance Settings -->
        <div v-if="activeTab === 'appearance'" class="settings-panel">
          <h2>Appearance Settings</h2>
          
          <div class="setting-group">
            <label for="theme">Theme</label>
            <select id="theme" v-model="appearanceSettings.theme">
              <option value="default">Default</option>
              <option value="dark">Dark Mode</option>
              <option value="light">Light Mode</option>
              <option value="jru">JRU Theme</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="primary-color">Primary Color</label>
            <div class="color-picker">
              <input id="primary-color" type="color" v-model="appearanceSettings.primaryColor" />
              <span class="color-code">{{ appearanceSettings.primaryColor }}</span>
            </div>
          </div>
          
          <div class="setting-group">
            <label for="secondary-color">Secondary Color</label>
            <div class="color-picker">
              <input id="secondary-color" type="color" v-model="appearanceSettings.secondaryColor" />
              <span class="color-code">{{ appearanceSettings.secondaryColor }}</span>
            </div>
          </div>
          
          <div class="setting-group">
            <label for="logo-upload">Upload Logo</label>
            <div class="file-upload">
              <input id="logo-upload" type="file" accept="image/*" />
              <label for="logo-upload">Choose File</label>
              <span class="file-name">No file chosen</span>
            </div>
          </div>
          
          <div class="setting-group">
            <label for="favicon-upload">Upload Favicon</label>
            <div class="file-upload">
              <input id="favicon-upload" type="file" accept="image/*" />
              <label for="favicon-upload">Choose File</label>
              <span class="file-name">No file chosen</span>
            </div>
          </div>
        </div>
        
        <!-- System Settings -->
        <div v-if="activeTab === 'system'" class="settings-panel">
          <h2>System Settings</h2>
          
          <div class="setting-group">
            <label for="cache-duration">Cache Duration (minutes)</label>
            <input id="cache-duration" type="number" v-model="systemSettings.cacheDuration" min="0" max="1440" />
          </div>
          
          <div class="setting-group">
            <label for="max-upload">Maximum Upload Size (MB)</label>
            <input id="max-upload" type="number" v-model="systemSettings.maxUploadSize" min="1" max="100" />
          </div>
          
          <div class="setting-group">
            <label for="log-level">Log Level</label>
            <select id="log-level" v-model="systemSettings.logLevel">
              <option value="debug">Debug</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="backup-frequency">Database Backup Frequency</label>
            <select id="backup-frequency" v-model="systemSettings.backupFrequency">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          
          <div class="setting-group">
            <label for="enable-api">Enable API Access</label>
            <div class="toggle-switch">
              <input type="checkbox" id="enable-api" v-model="systemSettings.enableApi" />
              <label for="enable-api"></label>
            </div>
          </div>
          
          <button class="test-btn" @click="clearCache">Clear Cache</button>
        </div>
        
        <div class="action-buttons">
          <button class="cancel-btn" @click="resetSettings">Reset Changes</button>
          <button class="save-btn" @click="saveSettings">Save Changes</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import Header from '@/components/header.vue';
import SideBar from '@/components/admin/sidebar.vue';

export default {
  name: 'SystemSettings',
  components: {
    Header,
    SideBar,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      searchQuery: '',
      user: {
        name: 'Admin User',
        role: 'admin'
      },
      isSidebarCollapsed: false,
      activeTab: 'general',
      isSaving: false,
      tabs: [
        { id: 'general', name: 'General', icon: 'pi pi-cog' },
        { id: 'user', name: 'User Management', icon: 'pi pi-users' },
        { id: 'course', name: 'Courses', icon: 'pi pi-book' },
        { id: 'email', name: 'Email', icon: 'pi pi-envelope' },
        { id: 'appearance', name: 'Appearance', icon: 'pi pi-palette' },
        { id: 'system', name: 'System', icon: 'pi pi-server' }
      ],
      generalSettings: {
        siteName: 'JRU Learning Management System',
        siteDescription: 'Official Learning Management System for Jack Roberto University',
        timezone: 'Asia/Manila',
        dateFormat: 'MM/DD/YYYY',
        maintenanceMode: false
      },
      userSettings: {
        allowRegistration: true,
        defaultRole: 'student',
        passwordPolicy: 'medium',
        sessionTimeout: 60,
        twoFactorAuth: false
      },
      courseSettings: {
        academicYear: '2023-2024',
        semester: 'first',
        maxEnrollment: 50,
        autoArchive: 'semester',
        enableWaitlist: true
      },
      emailSettings: {
        fromEmail: 'noreply@jru.edu',
        fromName: 'JRU Learning Management System',
        smtpHost: 'smtp.jru.edu',
        smtpPort: 587,
        encryption: 'tls',
        username: 'smtp_user',
        password: '********'
      },
      appearanceSettings: {
        theme: 'jru',
        primaryColor: '#002244',
        secondaryColor: '#007BF6'
      },
      systemSettings: {
        cacheDuration: 60,
        maxUploadSize: 20,
        logLevel: 'info',
        backupFrequency: 'daily',
        enableApi: true
      },
      originalSettings: {}
    };
  },
  created() {
    // Store original settings for reset functionality
    this.backupSettings();
  },
  methods: {
    toggleSidebar() {
      this.isSidebarCollapsed = !this.isSidebarCollapsed;
    },
    saveSettings() {
      this.isSaving = true;
      
      // Simulate API call
      setTimeout(() => {
        this.isSaving = false;
        this.backupSettings();
        this.toast.success('Settings saved successfully');
      }, 1500);
    },
    resetSettings() {
      // Reset to original values
      this.generalSettings = JSON.parse(JSON.stringify(this.originalSettings.generalSettings));
      this.userSettings = JSON.parse(JSON.stringify(this.originalSettings.userSettings));
      this.courseSettings = JSON.parse(JSON.stringify(this.originalSettings.courseSettings));
      this.emailSettings = JSON.parse(JSON.stringify(this.originalSettings.emailSettings));
      this.appearanceSettings = JSON.parse(JSON.stringify(this.originalSettings.appearanceSettings));
      this.systemSettings = JSON.parse(JSON.stringify(this.originalSettings.systemSettings));
      
      this.toast.info('Settings have been reset to their previous values');
    },
    backupSettings() {
      this.originalSettings = {
        generalSettings: JSON.parse(JSON.stringify(this.generalSettings)),
        userSettings: JSON.parse(JSON.stringify(this.userSettings)),
        courseSettings: JSON.parse(JSON.stringify(this.courseSettings)),
        emailSettings: JSON.parse(JSON.stringify(this.emailSettings)),
        appearanceSettings: JSON.parse(JSON.stringify(this.appearanceSettings)),
        systemSettings: JSON.parse(JSON.stringify(this.systemSettings))
      };
    },
    testEmail() {
      this.toast.info('Sending test email...');
      
      // Simulate API call
      setTimeout(() => {
        this.toast.success('Test email sent successfully');
      }, 1000);
    },
    clearCache() {
      this.toast.info('Clearing system cache...');
      
      // Simulate API call
      setTimeout(() => {
        this.toast.success('Cache cleared successfully');
      }, 1000);
    }
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.dashboard-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.dashboard-main {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  position: relative;
}

.page-info {
  max-width: 60%;
  margin-bottom: 20px;
}
  .page-description {
    color: #7f8c8d;
    font-size: 14px;
  }

  .page-title {
    color: #2c3e50;
    font-size: 24px;
    font-weight: 600;
  }
  

/* Tabs */
.settings-tabs {
  display: flex;
  background-color: white;
  margin-bottom: 25px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.tab-item {
  padding: 15px 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.3s;
  color: #666;
  font-weight: 500;
}

.tab-item:hover {
  background-color: #f8f9fa;
}

.tab-item.active {
  background-color: #007BF6;
  color: white;
}

.tab-item i {
  font-size: 16px;
}

/* Settings Panel */
.settings-panel {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
}

.settings-panel h2 {
  margin-top: 0;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.setting-group input[type="text"],
.setting-group input[type="email"],
.setting-group input[type="password"],
.setting-group input[type="number"],
.setting-group select,
.setting-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  background-color: #f8f9fa;
}

.setting-group textarea {
  min-height: 100px;
  resize: vertical;
}

/* Toggle Switch */
.toggle-switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-switch label {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 30px;
}

.toggle-switch label:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-switch input:checked + label {
  background-color: #007BF6;
}

.toggle-switch input:checked + label:before {
  transform: translateX(30px);
}

/* Color Picker */
.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
}

.color-picker input[type="color"] {
  width: 50px;
  height: 40px;
  padding: 0;
  border: none;
  cursor: pointer;
}

.color-code {
  font-family: monospace;
  font-size: 14px;
  color: #666;
}

/* File Upload */
.file-upload {
  display: flex;
  align-items: center;
  gap: 10px;
}

.file-upload input[type="file"] {
  display: none;
}

.file-upload label {
  display: inline-block;
  padding: 8px 16px;
  background-color: #f0f0f0;
  color: #333;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.file-upload label:hover {
  background-color: #e0e0e0;
}

.file-name {
  color: #666;
  font-size: 13px;
}

/* Buttons */
.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 20px;
}

.save-btn, .cancel-btn, .test-btn {
  padding: 10px 20px;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn {
  background-color: #007BF6;
  color: white;
  border: none;
}

.save-btn:hover {
  background-color: #0056b3;
}

.cancel-btn {
  background-color: #f8f9fa;
  color: #333;
  border: 1px solid #ddd;
}

.cancel-btn:hover {
  background-color: #e9ecef;
}

.test-btn {
  background-color: #6c757d;
  color: white;
  border: none;
  margin-top: 10px;
}

.test-btn:hover {
  background-color: #5a6268;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007BF6;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .settings-tabs {
    flex-wrap: wrap;
  }
  
  .tab-item {
    flex: 1 0 33.33%;
    justify-content: center;
  }
}
</style> 