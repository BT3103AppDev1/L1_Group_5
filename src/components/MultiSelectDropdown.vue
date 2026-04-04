<script setup>
import { computed, onMounted, onUnmounted, ref } from "vue";
import { ChevronDown, Check } from "lucide-vue-next";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  placeholder: {
    type: String,
    default: "Select options",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const isOpen = ref(false);
const dropdownRef = ref(null);

const selectedSummary = computed(() => {
  if (props.modelValue.length === 0) {
    return props.placeholder;
  }

  if (props.modelValue.length <= 2) {
    return props.modelValue.join(", ");
  }

  return `${props.modelValue.length} selected`;
});

const toggleOpen = () => {
  if (props.disabled) {
    return;
  }

  isOpen.value = !isOpen.value;
};

const updateSelection = (option) => {
  if (props.disabled) {
    return;
  }

  const exists = props.modelValue.includes(option);
  const nextValue = exists
    ? props.modelValue.filter((value) => value !== option)
    : [...props.modelValue, option];

  emit("update:modelValue", nextValue);
};

const closeOnOutsideClick = (event) => {
  if (!dropdownRef.value?.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", closeOnOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener("click", closeOnOutsideClick);
});
</script>

<template>
  <div ref="dropdownRef" class="multi-select" :class="{ disabled: disabled }">
    <button
      type="button"
      class="multi-select-trigger"
      :disabled="disabled"
      @click="toggleOpen"
    >
      <span :class="{ placeholder: modelValue.length === 0 }">
        {{ selectedSummary }}
      </span>
      <ChevronDown class="chevron" :class="{ open: isOpen }" />
    </button>

    <div v-if="isOpen" class="multi-select-menu">
      <button
        v-for="option in options"
        :key="option"
        type="button"
        class="multi-select-option"
        @click="updateSelection(option)"
      >
        <span>{{ option }}</span>
        <Check v-if="modelValue.includes(option)" class="check-icon" />
      </button>

      <p v-if="options.length === 0" class="empty-state">
        No options available yet.
      </p>
    </div>

    <div v-if="modelValue.length > 0" class="selected-chips">
      <span
        v-for="selected in modelValue"
        :key="selected"
        class="selected-chip"
      >
        {{ selected }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.multi-select {
  position: relative;
}

.multi-select.disabled {
  opacity: 0.65;
}

.multi-select-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: 1px solid var(--brand-border);
  border-radius: 16px;
  background: #ffffff;
  color: var(--brand-text);
  padding: 16px 18px;
  font-size: 15px;
  cursor: pointer;
  text-align: left;
}

.placeholder {
  color: #94a3b8;
}

.chevron {
  width: 18px;
  height: 18px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.multi-select-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  max-height: 240px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.12);
  padding: 8px;
  z-index: 20;
}

.multi-select-option {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--brand-text);
  padding: 12px 14px;
  cursor: pointer;
}

.multi-select-option:hover {
  background: #f8fafc;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: var(--brand-green-dark);
}

.empty-state {
  padding: 14px 12px;
  color: var(--brand-text-muted);
  font-size: 14px;
}

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.selected-chip {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(56, 200, 143, 0.12);
  color: var(--brand-green-dark);
  font-size: 13px;
  font-weight: 600;
}
</style>
