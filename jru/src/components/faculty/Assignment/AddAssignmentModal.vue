<template>
  <div class="modal-container">
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
  
        <label for="file-upload">Upload File:</label>
        <input type="file" @change="handleFileUpload" />
        <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

        <label for="external-link">External Link (Optional):</label>
        <input v-model="externalLink" type="url" placeholder="Enter external link (if any)" />
  
        <button @click="addAssignment" :disabled="isSubmitting">Add Assignment</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
  
export default {
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
      externalLink: "", // New field to store external link
      isSubmitting: false,
    };
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },
    async addAssignment() {
      if (!this.courseId || !this.title || !this.description || !this.due_date) {
        alert("Please fill in all required fields.");
        return;
      }

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("course_id", this.courseId);
      formData.append("title", this.title);
      formData.append("description", this.description);
      formData.append("due_date", this.due_date);

      // If file is uploaded, append it to formData
      if (this.file) {
        formData.append("file", this.file);
      }

      // If external link is provided, append it
      if (this.externalLink) {
        formData.append("external_link", this.externalLink);
      }

      try {
        const response = await axios.post('http://127.0.0.1:8000/api/assignments', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        alert("Assignment added successfully!");
        this.$emit("add-assignment", response.data);
        this.resetForm();
      } catch (error) {
        console.error("Error adding assignment:", error);
        alert("Failed to add assignment.");
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
      this.externalLink = ""; // Reset external link field
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
  margin-bottom: 10px;
}

.file-name {
  font-size: 14px;
  color: #007BF6;
  margin-bottom: 10px;
  font-weight: 600;
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
</style>
