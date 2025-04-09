<template>
  <div class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Edit Assignment</h2>
        
        <label for="title">Assignment Title:</label>
        <input v-model="title" type="text" placeholder="Enter Title" required />
  
        <label for="description">Assignment Description:</label>
        <textarea v-model="description" placeholder="Enter Description"></textarea>
  
        <label for="due_date">Due Date:</label>
        <input v-model="due_date" type="date" required />
  
        <label for="file-upload">Upload New File (Optional):</label>
        <input type="file" @change="handleFileUpload" />
        <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

        <label for="external-link">External Link (Optional):</label>
        <input v-model="externalLink" type="url" placeholder="Enter external link (if any)" />
  
        <button @click="confirmEditAssignment" :disabled="isSubmitting">Update Assignment</button>
      </div>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Update Assignment"
    message="Are you sure you want to update this assignment?"
    confirmText="Update"
    type="primary"
    @confirm="handleAssignmentUpdate"
    @cancel="showConfirmation = false"
  />
</template>

<script>
import axios from "axios";
import { useToast } from 'vue-toastification';
import ConfirmationModal from '@/components/ConfirmationModal.vue';

export default {
  components: {
    ConfirmationModal
  },
  props: {
    assignment: {
      type: Object,
      required: true
    }
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
      pendingAssignment: null
    };
  },
  watch: {
    assignment: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.title = newVal.title;
          this.description = newVal.description;
          this.due_date = newVal.due_date;
          this.externalLink = newVal.external_link || "";
        }
      }
    }
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },

    confirmEditAssignment() {
      const toast = useToast();

      if (!this.title || !this.description || !this.due_date) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingAssignment = {
        title: this.title,
        description: this.description,
        due_date: this.due_date,
        file: this.file,
        externalLink: this.externalLink
      };

      this.showConfirmation = true;
    },

    async handleAssignmentUpdate() {
      this.showConfirmation = false;
      const toast = useToast();

      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("title", this.pendingAssignment.title);
      formData.append("description", this.pendingAssignment.description);
      formData.append("due_date", this.pendingAssignment.due_date);

      if (this.pendingAssignment.file) {
        formData.append("file", this.pendingAssignment.file);
      }

      if (this.pendingAssignment.externalLink) {
        formData.append("external_link", this.pendingAssignment.externalLink);
      }

      try {
        await axios.put(`http://127.0.0.1:8000/api/assignments/${this.assignment.assignment_id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        toast.success('Assignment updated successfully!');
        this.$emit("update-assignment", {
          ...this.assignment,
          title: this.pendingAssignment.title,
          description: this.pendingAssignment.description,
          due_date: this.pendingAssignment.due_date,
          external_link: this.pendingAssignment.externalLink
        });
        this.closeModal();
      } catch (error) {
        console.error("Error updating assignment:", error);
        toast.error('Failed to update assignment.');
      } finally {
        this.isSubmitting = false;
      }
    },

    closeModal() {
      this.$emit("close");
    }
  }
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

.modal-content button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style> 