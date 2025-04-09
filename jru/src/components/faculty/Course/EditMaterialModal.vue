<template>
  <div class="modal-container">
    <div class="modal">
      <div class="modal-content">
        <span class="close" @click="closeModal">&times;</span>
        <h2>Edit Material</h2>
        
        <label for="title">Material Title:</label>
        <input v-model="title" type="text" placeholder="Enter Title" required />

        <label for="content">Material Content:</label>
        <textarea v-model="content" placeholder="Enter Content" rows="5"></textarea>

        <label for="file-upload">Upload New File (Optional):</label>
        <input type="file" @change="handleFileUpload" />
        <p v-if="fileName" class="file-name">Selected File: {{ fileName }}</p>

        <button @click="confirmEditMaterial" :disabled="isSubmitting">Update Material</button>
      </div>
    </div>
  </div>

  <ConfirmationModal
    :show="showConfirmation"
    title="Update Material"
    message="Are you sure you want to update this material?"
    confirmText="Update"
    type="primary"
    @confirm="handleMaterialUpdate"
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
    courseId: {
      type: Number,
      required: true
    },
    material: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      title: "",
      content: "",
      file: null,
      fileName: "",
      isSubmitting: false,
      showConfirmation: false,
      pendingMaterial: null
    };
  },
  watch: {
    material: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.title = newVal.title;
          this.content = newVal.content;
          if (newVal.file_path) {
            this.fileName = newVal.file_path.split('/').pop();
          }
        }
      }
    }
  },
  methods: {
    handleFileUpload(event) {
      this.file = event.target.files[0];
      this.fileName = this.file ? this.file.name : "";
    },

    confirmEditMaterial() {
      const toast = useToast();

      if (!this.title || !this.content) {
        toast.error('Please fill in all required fields.');
        return;
      }

      this.pendingMaterial = {
        title: this.title,
        content: this.content,
        file: this.file
      };

      this.showConfirmation = true;
    },

    async handleMaterialUpdate() {
      this.showConfirmation = false;
      const toast = useToast();
      this.isSubmitting = true;

      const formData = new FormData();
      formData.append("title", this.pendingMaterial.title);
      formData.append("content", this.pendingMaterial.content);
      if (this.pendingMaterial.file) {
        formData.append("file", this.pendingMaterial.file);
      }

      try {
        const response = await axios.put(
          `http://127.0.0.1:8000/api/course-content/${this.material.content_id}`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        toast.success('Material updated successfully!');
        this.$emit("update-material", {
          ...this.material,
          title: this.pendingMaterial.title,
          content: this.pendingMaterial.content,
          file_path: response.data.file_path || this.material.file_path
        });
        this.closeModal();
      } catch (error) {
        console.error("Error updating material:", error);
        toast.error('Failed to update material.');
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
  width: 500px;
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

.modal-content textarea {
  min-height: 120px;
  resize: vertical;
}

.file-name {
  font-size: 14px;
  color: #007BF6;
  margin-bottom: 15px;
  font-weight: 600;
}

.modal-content button {
  padding: 12px 20px;
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
  margin-top: 10px;
}

.modal-content button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.modal-content button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style> 