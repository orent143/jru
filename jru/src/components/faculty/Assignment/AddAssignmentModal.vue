<template>
  <div class="modal">
    <div class="modal-content">
      <span class="close" @click="closeModal">&times;</span>
      <h2>Add New Assignment</h2>

      <label for="title">Assignment Title:</label>
      <input v-model="title" type="text" placeholder="Enter Title" required />

      <label for="description">Assignment Description:</label>
      <textarea v-model="description" placeholder="Enter Description"></textarea>

      <label for="due_date">Due Date:</label>
      <input v-model="due_date" type="date" required />

      <label for="file-upload">Upload File (Optional):</label>
      <input type="file" @change="handleFileUpload" />
      <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

      <label for="external_link">External Link (Optional):</label>
      <input v-model="externalLink" type="url" placeholder="Enter external link (if any)" />

      <button @click="confirmAddAssignment" :disabled="isSubmitting">Add Assignment</button>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Add Assignment"
    message="Are you sure you want to add this assignment?"
    confirmText="Add"
    type="primary"
    @confirm="handleAssignmentSubmission"
    @cancel="showConfirmation = false"
  />
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  components: { ConfirmationModal },
  props: {
    courseId: Number,
  },
  data() {
    return {
      title: "",
      description: "",
      due_date: "",
      file: null,
      fileName: "",
      externalLink: "",
      isSubmitting: false,
      showConfirmation: false,
      pendingAssignment: null,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },
    confirmAddAssignment() {
      const toast = useToast();

      if (!this.courseId || !this.title || !this.description || !this.due_date) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingAssignment = {
        title: this.title,
        description: this.description,
        due_date: this.due_date,
        file: this.file,
        externalLink: this.externalLink,
      };

      this.showConfirmation = true;
    },
    async handleAssignmentSubmission() {
      this.showConfirmation = false;
      const toast = useToast();

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.pendingAssignment.title);
      formData.append("description", this.pendingAssignment.description);
      formData.append("due_date", this.pendingAssignment.due_date);

      let filePath = null;
      if (this.pendingAssignment.externalLink) {
        formData.append("external_link", this.pendingAssignment.externalLink);
        filePath = this.pendingAssignment.externalLink;
      } else if (this.pendingAssignment.file) {
        formData.append("file", this.pendingAssignment.file);
        filePath = "File uploaded";
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/assignments', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success('Assignment added successfully!');

        const assignmentData = response.data;
        if (!assignmentData.file_path && filePath) {
          assignmentData.file_path = filePath;
        }

        this.$emit("add-assignment", assignmentData);
        this.resetForm();
      } catch (error) {
        console.error("Error adding assignment:", error);
        toast.error('Failed to add assignment.');
      } finally {
        this.isSubmitting = false;
      }
    },
    resetForm() {
      this.title = "";
      this.description = "";
      this.due_date = "";
      this.file = null;
      this.fileName = "";
      this.externalLink = "";
      this.$emit("close");
    },
    closeModal() {
      this.resetForm();
    },
  },
};
</script>

<style scoped>
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

.modal-content label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
  color: #272727;
}

.modal-content input,
.modal-content textarea {
  padding: 10px;
  font-size: 14px;
  border-radius: 12px;
  width: 100%;
  border: 1px solid #ccc;
  margin-bottom: 15px;
}

.file-name {
  font-size: 14px;
  color: #007BF6;
  margin-bottom: 15px;
}

.modal-content button {
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

.modal-content button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
