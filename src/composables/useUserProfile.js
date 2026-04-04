import { computed, ref } from "vue";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  auth,
  db,
} from "../firebase";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile as updateAuthProfile,
} from "firebase/auth";

export const activityLevelOptions = [
  { label: "Lightly Active", value: "lightly_active", multiplier: 1.375 },
  { label: "Moderately Active", value: "moderately_active", multiplier: 1.55 },
  { label: "Active", value: "active", multiplier: 1.725 },
  { label: "Very Active", value: "very_active", multiplier: 1.9 },
];

export const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
  { label: "Prefer not to say", value: "prefer_not_to_say" },
];

export const goalOptions = [
  { label: "Maintain Weight", value: "maintain" },
  { label: "Lose Weight", value: "lose" },
  { label: "Gain Muscle", value: "gain" },
];

const goalMacroRatios = {
  maintain: { carbs: 0.45, protein: 0.25, fat: 0.3 },
  lose: { carbs: 0.35, protein: 0.35, fat: 0.3 },
  gain: { carbs: 0.4, protein: 0.3, fat: 0.3 },
};

const activityMultipliers = Object.fromEntries(
  activityLevelOptions.map((option) => [option.value, option.multiplier]),
);

const createDefaultProfile = (fullName = "") => ({
  fullName,
  age: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  activityLevel: "",
  bmi: null,
  goalType: "maintain",
  dailyCalories: null,
  macroTargets: {
    carbsG: null,
    proteinG: null,
    fatG: null,
  },
  preferredCuisines: [],
  dietaryPreferences: [],
});

const cloneProfile = (value) =>
  JSON.parse(JSON.stringify(value));

const parseNumber = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const roundToSingleDecimal = (value) =>
  Math.round(value * 10) / 10;

const hasSupportedGender = (gender) =>
  gender === "male" || gender === "female";

const buildMacroTargets = (dailyCalories, goalType) => {
  const ratios = goalMacroRatios[goalType] || goalMacroRatios.maintain;

  return {
    carbsG: Math.round((dailyCalories * ratios.carbs) / 4),
    proteinG: Math.round((dailyCalories * ratios.protein) / 4),
    fatG: Math.round((dailyCalories * ratios.fat) / 9),
  };
};

const calculateDerivedMetrics = (profileInput) => {
  const target = cloneProfile(profileInput);

  const heightCm = parseNumber(target.heightCm);
  const weightKg = parseNumber(target.weightKg);
  const age = parseNumber(target.age);
  const activityMultiplier = activityMultipliers[target.activityLevel];

  if (heightCm && weightKg) {
    const heightMeters = heightCm / 100;
    target.bmi = roundToSingleDecimal(weightKg / (heightMeters * heightMeters));
  } else {
    target.bmi = null;
  }

  if (
    age &&
    heightCm &&
    weightKg &&
    activityMultiplier &&
    hasSupportedGender(target.gender)
  ) {
    const baseBmr =
      10 * weightKg +
      6.25 * heightCm -
      5 * age +
      (target.gender === "male" ? 5 : -161);

    const tdee = baseBmr * activityMultiplier;

    let dailyCalories = tdee;
    if (target.goalType === "lose") {
      dailyCalories -= 500;
    } else if (target.goalType === "gain") {
      dailyCalories += 250;
    }

    const roundedCalories = Math.round(dailyCalories);
    target.dailyCalories = roundedCalories;
    target.macroTargets = buildMacroTargets(roundedCalories, target.goalType);
  } else {
    target.dailyCalories = null;
    target.macroTargets = {
      carbsG: null,
      proteinG: null,
      fatG: null,
    };
  }

  return target;
};

const sanitizeForStorage = (profileInput) => {
  const derived = calculateDerivedMetrics(profileInput);

  return {
    fullName: String(derived.fullName || "").trim(),
    age: parseNumber(derived.age),
    gender: derived.gender || "",
    heightCm: parseNumber(derived.heightCm),
    weightKg: parseNumber(derived.weightKg),
    activityLevel: derived.activityLevel || "",
    bmi: derived.bmi,
    goalType: derived.goalType || "maintain",
    dailyCalories: derived.dailyCalories,
    macroTargets: {
      carbsG: parseNumber(derived.macroTargets?.carbsG),
      proteinG: parseNumber(derived.macroTargets?.proteinG),
      fatG: parseNumber(derived.macroTargets?.fatG),
    },
    preferredCuisines: Array.isArray(derived.preferredCuisines)
      ? [...new Set(derived.preferredCuisines.map((value) => String(value).trim()).filter(Boolean))]
      : [],
    dietaryPreferences: Array.isArray(derived.dietaryPreferences)
      ? [...new Set(derived.dietaryPreferences.map((value) => String(value).trim()).filter(Boolean))]
      : [],
  };
};

const normalizeFromFirestore = (data) => {
  const normalized = createDefaultProfile(data.fullName || auth.currentUser?.displayName || "");

  normalized.fullName = data.fullName || auth.currentUser?.displayName || "";
  normalized.age = data.age ?? "";
  normalized.gender = data.gender || "";
  normalized.heightCm = data.heightCm ?? "";
  normalized.weightKg = data.weightKg ?? "";
  normalized.activityLevel = data.activityLevel || "";
  normalized.goalType = data.goalType || "maintain";
  normalized.preferredCuisines = Array.isArray(data.preferredCuisines)
    ? data.preferredCuisines
    : [];
  normalized.dietaryPreferences = Array.isArray(data.dietaryPreferences)
    ? data.dietaryPreferences
    : [];

  return calculateDerivedMetrics(normalized);
};

const profile = ref(createDefaultProfile());
const draft = ref(createDefaultProfile());
const loading = ref(false);
const saving = ref(false);
const isEditing = ref(false);
const profileExists = ref(false);
const loadedUid = ref("");
const hasLoadedProfile = ref(false);

const profileName = computed(
  () => profile.value.fullName || auth.currentUser?.displayName || "",
);

const profileFirstName = computed(() => {
  const name = profileName.value.trim();
  return name ? name.split(/\s+/)[0] : "";
});

const hasAutoNutritionInputs = computed(() => {
  const derived = calculateDerivedMetrics(draft.value);
  return derived.dailyCalories !== null;
});

const nutritionHelperText = computed(() => {
  if (hasAutoNutritionInputs.value) {
    return "Calories and macros update automatically from your profile data.";
  }

  if (!draft.value.gender || !hasSupportedGender(draft.value.gender)) {
    return "Select Male or Female to enable calorie and macro auto-calculation.";
  }

  if (!draft.value.activityLevel) {
    return "Choose an activity level to generate calorie and macro targets.";
  }

  return "Enter age, height, and weight to generate calorie and macro targets.";
});

const applyDerivedMetrics = () => {
  return calculateDerivedMetrics(draft.value);
};

const resetToCurrentProfile = () => {
  draft.value = cloneProfile(profile.value);
};

const loadProfile = async (uid) => {
  if (!uid) {
    profile.value = createDefaultProfile();
    draft.value = createDefaultProfile();
    profileExists.value = false;
    isEditing.value = true;
    loadedUid.value = "";
    hasLoadedProfile.value = false;
    return profile.value;
  }

  if (loadedUid.value === uid && hasLoadedProfile.value) {
    return profile.value;
  }

  loading.value = true;

  try {
    const profileRef = doc(db, "profiles", uid);
    const snapshot = await getDoc(profileRef);

    if (snapshot.exists()) {
      const normalized = normalizeFromFirestore(snapshot.data());
      profile.value = normalized;
      draft.value = cloneProfile(normalized);
      profileExists.value = true;
      isEditing.value = false;
    } else {
      const emptyProfile = createDefaultProfile(auth.currentUser?.displayName || "");
      profile.value = emptyProfile;
      draft.value = cloneProfile(emptyProfile);
      profileExists.value = false;
      isEditing.value = true;
    }

    loadedUid.value = uid;
    hasLoadedProfile.value = true;
    return profile.value;
  } finally {
    loading.value = false;
  }
};

const startEditing = () => {
  draft.value = cloneProfile(profile.value);
  isEditing.value = true;
};

const cancelEdits = () => {
  if (profileExists.value) {
    draft.value = cloneProfile(profile.value);
    isEditing.value = false;
  } else {
    const emptyProfile = createDefaultProfile(auth.currentUser?.displayName || "");
    profile.value = emptyProfile;
    draft.value = cloneProfile(emptyProfile);
    isEditing.value = true;
  }
};

const saveProfile = async (uid) => {
  if (!uid) {
    throw new Error("No authenticated user found.");
  }

  saving.value = true;

  try {
    const sanitized = sanitizeForStorage(draft.value);
    const profileRef = doc(db, "profiles", uid);

    if (auth.currentUser) {
      await updateAuthProfile(auth.currentUser, {
        displayName: sanitized.fullName || null,
      });
    }

    await setDoc(
      profileRef,
      {
        ...sanitized,
        ...(!profileExists.value ? { createdAt: serverTimestamp() } : {}),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    profile.value = normalizeFromFirestore(sanitized);
    draft.value = cloneProfile(profile.value);
    profileExists.value = true;
    isEditing.value = false;
    loadedUid.value = uid;
    hasLoadedProfile.value = true;

    return profile.value;
  } finally {
    saving.value = false;
  }
};

const savePassword = async (currentPassword, newPassword, confirmPassword) => {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    throw new Error("No authenticated user found.");
  }

  if (!currentPassword || !newPassword || !confirmPassword) {
    const error = new Error("Current password, new password, and confirm password are all required.");
    error.code = "profile/password-fields-required";
    throw error;
  }

  if (newPassword !== confirmPassword) {
    const error = new Error("New Password and Confirm Password must match.");
    error.code = "profile/password-mismatch";
    throw error;
  }

  const hasPasswordProvider = currentUser.providerData.some(
    (provider) => provider.providerId === "password",
  );

  if (!hasPasswordProvider || !currentUser.email) {
    const error = new Error(
      "This account does not support password updates with a current password check.",
    );
    error.code = "profile/password-provider-unsupported";
    throw error;
  }

  const credential = EmailAuthProvider.credential(
    currentUser.email,
    currentPassword,
  );

  await reauthenticateWithCredential(currentUser, credential);
  await updatePassword(currentUser, newPassword);
};

export function useUserProfile() {
  return {
    profile,
    draft,
    loading,
    saving,
    isEditing,
    profileExists,
    profileName,
    profileFirstName,
    hasAutoNutritionInputs,
    nutritionHelperText,
    loadProfile,
    startEditing,
    cancelEdits,
    applyDerivedMetrics,
    saveProfile,
    savePassword,
  };
}
