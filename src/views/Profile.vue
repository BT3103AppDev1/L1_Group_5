<script setup>
import { computed, onMounted, ref } from "vue";
import { onAuthStateChanged } from "firebase/auth";
import {
  BadgeCheck,
  Pencil,
  Save,
  Settings2,
  ShieldCheck,
  Target,
  UserRound,
  X,
} from "lucide-vue-next";
import { auth } from "../firebase";
import Sidebar from "../components/Sidebar.vue";
import MultiSelectDropdown from "../components/MultiSelectDropdown.vue";
import { useRestaurantFilterOptions } from "../composables/useRestaurantFilterOptions";
import { endSession } from "../services/authSession";
import {
  activityLevelOptions,
  genderOptions,
  goalOptions,
  useUserProfile,
} from "../composables/useUserProfile";

const { options, fetchAll } = useRestaurantFilterOptions();
const {
  profile,
  draft,
  loading,
  saving,
  isEditing,
  profileExists,
  hasAutoNutritionInputs,
  nutritionHelperText,
  loadProfile,
  startEditing,
  cancelEdits,
  applyDerivedMetrics,
  saveProfile,
  savePassword,
} = useUserProfile();

const banner = ref({
  type: "",
  message: "",
});

const passwordBanner = ref({
  type: "",
  message: "",
});

const passwordForm = ref({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const isPasswordSaving = ref(false);

const canEnterNewPassword = computed(() =>
  passwordForm.value.currentPassword.trim().length > 0,
);

const isPasswordFormComplete = computed(() =>
  passwordForm.value.currentPassword.trim().length > 0 &&
  passwordForm.value.newPassword.trim().length > 0 &&
  passwordForm.value.confirmPassword.trim().length > 0,
);

const cuisinePreferencesModel = computed({
  get: () => draft.value.preferredCuisines,
  set: (value) => {
    draft.value = {
      ...draft.value,
      preferredCuisines: value,
    };
  },
});

const dietaryPreferencesModel = computed({
  get: () => draft.value.dietaryPreferences,
  set: (value) => {
    draft.value = {
      ...draft.value,
      dietaryPreferences: value,
    };
  },
});

const getCurrentUser = () =>
  new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });

const pageSubtitle = computed(() => {
  return "Manage your personal information and nutrition goals.";
});

const liveDraft = computed(() => applyDerivedMetrics());

const bmiDisplay = computed(() =>
  liveDraft.value.bmi !== null ? liveDraft.value.bmi.toFixed(1) : "--",
);

const dailyCaloriesDisplay = computed(() =>
  liveDraft.value.dailyCalories !== null ? liveDraft.value.dailyCalories : "--",
);

const macroDisplay = computed(() => ({
  carbs: liveDraft.value.macroTargets?.carbsG ?? "--",
  protein: liveDraft.value.macroTargets?.proteinG ?? "--",
  fat: liveDraft.value.macroTargets?.fatG ?? "--",
}));

const requiredFieldsMissing = computed(() => {
  return (
    draft.value.age === "" ||
    draft.value.heightCm === "" ||
    draft.value.weightKg === ""
  );
});

const requiredFieldsInvalid = computed(() => {
  return (
    Number(draft.value.age) <= 0 ||
    Number(draft.value.heightCm) <= 0 ||
    Number(draft.value.weightKg) <= 0
  );
});

const setBanner = (type, message) => {
  banner.value = { type, message };
};

const clearBanner = () => {
  banner.value = { type: "", message: "" };
};

const setPasswordBanner = (type, message) => {
  passwordBanner.value = { type, message };
};

const clearPasswordBanner = () => {
  passwordBanner.value = { type: "", message: "" };
};

const handleEdit = () => {
  clearBanner();
  clearPasswordBanner();
  startEditing();
};

const handleCancel = () => {
  clearBanner();
  clearPasswordBanner();
  cancelEdits();
};

const handleSave = async () => {
  clearBanner();
  clearPasswordBanner();

  const user = auth.currentUser;
  if (!user) {
    setBanner("error", "Please sign in again before updating your profile.");
    return;
  }

  if (requiredFieldsMissing.value) {
    setBanner(
      "warning",
      "Age, height, and weight are required before you can save your profile.",
    );
    return;
  }

  if (requiredFieldsInvalid.value) {
    setBanner(
      "warning",
      "Age, height, and weight must all be greater than zero.",
    );
    return;
  }

  try {
    const wasExistingProfile = profileExists.value;
    await saveProfile(user.uid);
    setBanner(
      "success",
      wasExistingProfile
        ? "Your profile has been updated successfully."
        : "Your profile has been saved successfully.",
    );
  } catch (error) {
    setBanner(
      "error",
      error.message || "We couldn't save your profile right now.",
    );
  }
};

const handlePasswordSave = async () => {
  clearBanner();
  clearPasswordBanner();
  isPasswordSaving.value = true;

  try {
    await savePassword(
      passwordForm.value.currentPassword,
      passwordForm.value.newPassword,
      passwordForm.value.confirmPassword,
    );

    passwordForm.value.currentPassword = "";
    passwordForm.value.newPassword = "";
    passwordForm.value.confirmPassword = "";
    setPasswordBanner(
      "success",
      "Your password was updated successfully. Please sign in again with your new password.",
    );
    await new Promise((resolve) => window.setTimeout(resolve, 1200));
    await endSession("manual", "/");
  } catch (error) {
    if (error.code === "auth/requires-recent-login") {
      setPasswordBanner(
        "warning",
        "For security reasons, please log out and log back in before changing your password.",
      );
    } else if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password"
    ) {
      setPasswordBanner("error", "Your current password is incorrect.");
    } else if (error.code === "profile/password-fields-required") {
      setPasswordBanner(
        "warning",
        "Current password, new password, and confirm password are all required.",
      );
    } else if (error.code === "profile/password-mismatch") {
      setPasswordBanner(
        "warning",
        "New Password and Confirm Password must match.",
      );
    } else if (error.code === "profile/password-provider-unsupported") {
      setPasswordBanner(
        "warning",
        "This account does not support password changes with a current password check.",
      );
    } else if (error.code === "auth/weak-password") {
      setPasswordBanner(
        "warning",
        "Your new password is too weak. Please use at least 6 characters.",
      );
    } else {
      setPasswordBanner(
        "error",
        error.message || "We couldn't update your password right now.",
      );
    }
  } finally {
    isPasswordSaving.value = false;
  }
};

const selectGoal = (goalValue) => {
  if (!isEditing.value) {
    return;
  }

  draft.value = {
    ...draft.value,
    goalType: goalValue,
  };
};

onMounted(async () => {
  const user = await getCurrentUser();
  await fetchAll();

  if (!user) {
    setBanner("warning", "Please sign in again before editing your profile.");
    return;
  }

  await loadProfile(user.uid);
});
</script>

<template>
  <div class="layout">
    <Sidebar />

    <main class="main">
      <div class="page-shell">
        <header class="page-header">
          <div>
            <p class="eyebrow">Account</p>
            <h1>Profile Settings</h1>
            <p class="subtitle">{{ pageSubtitle }}</p>
          </div>

          <div class="header-actions">
            <button
              v-if="profileExists && !isEditing"
              type="button"
              class="ghost-action"
              @click="handleEdit"
            >
              <Pencil class="action-icon" />
              Edit
            </button>

            <template v-else>
              <button type="button" class="ghost-action" @click="handleCancel">
                <X class="action-icon" />
                Cancel
              </button>

              <button
                type="button"
                class="primary-action"
                :disabled="saving"
                @click="handleSave"
              >
                <Save class="action-icon" />
                {{ saving ? "Saving..." : "Save" }}
              </button>
            </template>
          </div>
        </header>

        <div
          v-if="banner.message"
          class="banner"
          :class="`banner-${banner.type}`"
        >
          {{ banner.message }}
        </div>

        <div v-if="loading" class="loading-card">
          Loading your profile settings...
        </div>

        <template v-else>
          <section class="card-section">
            <div class="section-header">
              <div class="section-icon">
                <UserRound />
              </div>
              <div>
                <h2>Personal Information</h2>
                <p>Save your core health stats so MunchMap can personalize your nutrition targets.</p>
              </div>
            </div>

            <div class="form-grid">
              <div class="field-group">
                <label for="profile-full-name">Full Name</label>
                <input
                  id="profile-full-name"
                  v-model.trim="draft.fullName"
                  type="text"
                  class="field-input"
                  :disabled="!isEditing"
                  placeholder="Enter your full name"
                />
              </div>

              <div class="field-group">
                <label for="profile-age">Age</label>
                <input
                  id="profile-age"
                  v-model.number="draft.age"
                  type="number"
                  min="1"
                  class="field-input"
                  :disabled="!isEditing"
                  placeholder="Enter your age"
                />
              </div>

              <div class="field-group">
                <label for="profile-gender">Gender</label>
                <select
                  id="profile-gender"
                  v-model="draft.gender"
                  class="field-input"
                  :disabled="!isEditing"
                >
                  <option value="">Select gender</option>
                  <option
                    v-for="option in genderOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="field-group">
                <label for="profile-height">Height (cm)</label>
                <input
                  id="profile-height"
                  v-model.number="draft.heightCm"
                  type="number"
                  min="1"
                  class="field-input"
                  :disabled="!isEditing"
                  placeholder="Enter your height"
                />
              </div>

              <div class="field-group">
                <label for="profile-weight">Weight (kg)</label>
                <input
                  id="profile-weight"
                  v-model.number="draft.weightKg"
                  type="number"
                  min="1"
                  step="0.1"
                  class="field-input"
                  :disabled="!isEditing"
                  placeholder="Enter your weight"
                />
              </div>

              <div class="field-group">
                <label for="profile-activity">Activity Level</label>
                <select
                  id="profile-activity"
                  v-model="draft.activityLevel"
                  class="field-input"
                  :disabled="!isEditing"
                >
                  <option value="">Select activity level</option>
                  <option
                    v-for="option in activityLevelOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>
            </div>

            <div class="metric-card">
              <div>
                <p class="metric-label">Body Mass Index</p>
                <h3>{{ bmiDisplay }}</h3>
              </div>
              <BadgeCheck class="metric-icon" />
            </div>
          </section>

          <section class="card-section">
            <div class="section-header">
              <div class="section-icon">
                <Target />
              </div>
              <div>
                <h2>Nutrition Goals</h2>
                <p>Choose a goal and let your calorie target and macros update automatically.</p>
              </div>
            </div>

            <div class="goal-buttons">
              <button
                v-for="goal in goalOptions"
                :key="goal.value"
                type="button"
                class="goal-button"
                :class="{ active: draft.goalType === goal.value }"
                :disabled="!isEditing"
                @click="selectGoal(goal.value)"
              >
                {{ goal.label }}
              </button>
            </div>

            <p class="helper-text" :class="{ muted: !hasAutoNutritionInputs }">
              {{ nutritionHelperText }}
            </p>

            <div class="field-group">
              <label>Daily Calorie Goal</label>
              <input
                :value="dailyCaloriesDisplay"
                type="text"
                class="field-input derived-input"
                disabled
              />
            </div>

            <div class="macro-grid">
              <div class="field-group">
                <label>Carbs (g/day)</label>
                <input
                  :value="macroDisplay.carbs"
                  type="text"
                  class="field-input derived-input"
                  disabled
                />
              </div>

              <div class="field-group">
                <label>Protein (g/day)</label>
                <input
                  :value="macroDisplay.protein"
                  type="text"
                  class="field-input derived-input"
                  disabled
                />
              </div>

              <div class="field-group">
                <label>Fat (g/day)</label>
                <input
                  :value="macroDisplay.fat"
                  type="text"
                  class="field-input derived-input"
                  disabled
                />
              </div>
            </div>
          </section>

          <section class="card-section">
            <div class="section-header">
              <div class="section-icon">
                <Settings2 />
              </div>
              <div>
                <h2>Preferences</h2>
                <p>Select your preferred cuisines and dietary filters from the same options used on the map.</p>
              </div>
            </div>

            <div class="preferences-grid">
              <div class="field-group">
                <label>Cuisine Preferences</label>
                <MultiSelectDropdown
                  v-model="cuisinePreferencesModel"
                  :options="options.cuisines"
                  :disabled="!isEditing"
                  placeholder="Select cuisine preferences"
                />
              </div>

              <div class="field-group">
                <label>Dietary Preferences</label>
                <MultiSelectDropdown
                  v-model="dietaryPreferencesModel"
                  :options="options.dietary"
                  :disabled="!isEditing"
                  placeholder="Select dietary preferences"
                />
              </div>
            </div>
          </section>

          <section class="card-section">
            <div class="section-header">
              <div class="section-icon">
                <ShieldCheck />
              </div>
              <div>
                <h2>Security</h2>
                <p>Update your password. For sensitive changes, Firebase may require you to sign in again.</p>
              </div>
            </div>

            <div class="field-group security-current-password">
              <label for="current-password">Current Password</label>
              <input
                id="current-password"
                v-model="passwordForm.currentPassword"
                type="password"
                class="field-input"
                placeholder="Enter your current password"
              />
            </div>

            <div class="security-grid">
              <div class="field-group">
                <label for="new-password">New Password</label>
                <input
                  id="new-password"
                  v-model="passwordForm.newPassword"
                  type="password"
                  class="field-input"
                  :disabled="!canEnterNewPassword"
                  :placeholder="
                    canEnterNewPassword
                      ? 'Enter your new password'
                      : 'Enter your current password first'
                  "
                />
              </div>

              <div class="field-group">
                <label for="confirm-password">Confirm Password</label>
                <input
                  id="confirm-password"
                  v-model="passwordForm.confirmPassword"
                  type="password"
                  class="field-input"
                  :disabled="!canEnterNewPassword"
                  :placeholder="
                    canEnterNewPassword
                      ? 'Confirm your new password'
                      : 'Enter your current password first'
                  "
                />
              </div>
            </div>

            <div class="security-actions">
              <button
                type="button"
                class="primary-action"
                :disabled="isPasswordSaving || !isPasswordFormComplete"
                @click="handlePasswordSave"
              >
                <Save class="action-icon" />
                {{ isPasswordSaving ? "Saving..." : "Save Password" }}
              </button>
            </div>

            <div
              v-if="passwordBanner.message"
              class="banner banner-bottom"
              :class="`banner-${passwordBanner.type}`"
            >
              {{ passwordBanner.message }}
            </div>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
  background: #f6f8fb;
}

.main {
  flex: 1;
  margin-left: 240px;
  min-height: 100vh;
}

.page-shell {
  max-width: 980px;
  margin: 0 auto;
  padding: 36px 28px 56px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.eyebrow {
  margin-bottom: 8px;
  color: var(--brand-green-dark);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-header h1 {
  color: var(--brand-text);
  font-size: 42px;
  font-weight: 800;
  line-height: 1.1;
}

.subtitle {
  margin-top: 10px;
  color: var(--brand-text-muted);
  font-size: 17px;
}

.header-actions,
.security-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.security-actions {
  margin-top: 18px;
}

.banner-bottom {
  margin-top: 16px;
}

.primary-action,
.ghost-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.primary-action {
  border: none;
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: #ffffff;
  box-shadow: 0 14px 28px rgba(31, 159, 109, 0.18);
}

.ghost-action {
  border: 1px solid #dce3eb;
  background: #ffffff;
  color: var(--brand-text);
}

.primary-action:disabled,
.ghost-action:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.banner,
.loading-card {
  margin-bottom: 20px;
  border-radius: 18px;
  padding: 16px 18px;
  font-size: 15px;
  font-weight: 600;
}

.banner-success {
  background: rgba(56, 200, 143, 0.14);
  color: #0f7a50;
}

.banner-warning {
  background: rgba(245, 158, 11, 0.14);
  color: #9a6700;
}

.banner-error {
  background: rgba(239, 68, 68, 0.14);
  color: #b42318;
}

.loading-card {
  background: #ffffff;
  color: var(--brand-text-muted);
  border: 1px solid #e7edf3;
}

.card-section {
  background: #ffffff;
  border: 1px solid #e7edf3;
  border-radius: 28px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.04);
  padding: 28px;
}

.card-section + .card-section {
  margin-top: 22px;
}

.section-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 24px;
}

.section-icon {
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: rgba(56, 200, 143, 0.12);
  color: var(--brand-green-dark);
}

.section-header h2 {
  color: var(--brand-text);
  font-size: 28px;
  font-weight: 800;
  line-height: 1.15;
}

.section-header p {
  margin-top: 8px;
  color: var(--brand-text-muted);
  font-size: 15px;
}

.form-grid,
.macro-grid,
.preferences-grid,
.security-grid {
  display: grid;
  gap: 18px;
}

.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.macro-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-top: 18px;
}

.preferences-grid,
.security-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.security-current-password {
  margin-bottom: 18px;
}

.field-group label {
  display: block;
  margin-bottom: 10px;
  color: var(--brand-text);
  font-size: 15px;
  font-weight: 700;
}

.field-input {
  width: 100%;
  display: block;
  border: 1px solid var(--brand-border);
  border-radius: 16px;
  background: #ffffff;
  color: var(--brand-text);
  padding: 16px 18px;
  font-size: 15px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.field-input:focus {
  outline: none;
  border-color: var(--brand-green);
  box-shadow: 0 0 0 4px rgba(56, 200, 143, 0.14);
}

.field-input:disabled {
  background: #f8fafc;
  color: #475467;
  cursor: not-allowed;
}

.metric-card {
  margin-top: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 22px;
  padding: 20px 22px;
  background: linear-gradient(135deg, rgba(56, 200, 143, 0.14), rgba(255, 255, 255, 1));
}

.metric-label {
  color: var(--brand-text-muted);
  font-size: 14px;
  font-weight: 700;
}

.metric-card h3 {
  margin-top: 6px;
  color: var(--brand-text);
  font-size: 34px;
  font-weight: 800;
}

.metric-icon {
  width: 26px;
  height: 26px;
  color: var(--brand-green-dark);
}

.goal-buttons {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.goal-button {
  border: 1px solid #e7edf3;
  border-radius: 16px;
  background: #f8fafc;
  color: #4b5565;
  padding: 15px 18px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.goal-button.active {
  border-color: rgba(56, 200, 143, 0.18);
  background: linear-gradient(135deg, var(--brand-green), var(--brand-green-dark));
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(31, 159, 109, 0.16);
}

.goal-button:disabled {
  cursor: not-allowed;
}

.helper-text {
  margin: 16px 0 18px;
  color: var(--brand-green-dark);
  font-size: 14px;
  font-weight: 600;
}

.helper-text.muted {
  color: #7c8a9a;
}

.derived-input {
  font-weight: 700;
}

.action-icon {
  width: 16px;
  height: 16px;
}

@media (max-width: 1080px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 900px) {
  .main {
    margin-left: 0;
  }

  .page-shell {
    padding: 24px 18px 40px;
  }

  .form-grid,
  .macro-grid,
  .preferences-grid,
  .security-grid,
  .goal-buttons {
    grid-template-columns: 1fr;
  }

  .card-section {
    padding: 22px;
  }

  .page-header h1 {
    font-size: 34px;
  }
}
</style>
