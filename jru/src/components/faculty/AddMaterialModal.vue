<template>
    <div class="modal">
      <div class="modal-content">
        <div class="modal-header">Add New Material</div>
        <div class="modal-body">
          <input v-model="title" type="text" placeholder="Material Title" />
        </div>
        <div class="modal-buttons">
          <button class="close" @click="$emit('close')">Cancel</button>
          <button class="submit" @click="addMaterial">Add</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        title: ''
      };
    },
    methods: {
      addMaterial() {
        if (this.title.trim()) {
          this.$emit('add-material', {
            id: Date.now(),
            title: this.title
          });
          this.$emit('close');
        }
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
  }
  
  .modal-content {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 400px;
    text-align: center;
  }
  
  .modal-header {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .modal-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
  }
  
  .modal-buttons button {
    padding: 8px 12px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
  }
  
  .modal-buttons .close {
    background: red;
    color: white;
  }
  
  .modal-buttons .submit {
    background: green;
    color: white;
  }  </style>
  