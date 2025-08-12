let currentUser = null;
let studentPhotoDataUrl = null;
const homePage = document.getElementById("homePage");
const studioPage = document.getElementById("studioPage");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const userEmailSpan = document.getElementById("userEmail");
const studentForm = document.getElementById("studentForm");
const loadingOverlay = document.getElementById("loadingOverlay");
const studentNameInput = document.getElementById("studentName");
const courseInput = document.getElementById("course");
const rollNoInput = document.getElementById("rollNo");
const durationInput = document.getElementById("duration");
const dobInput = document.getElementById("dob");
const bloodGroupInput = document.getElementById("bloodGroup");
const contactNoInput = document.getElementById("contactNo");
const addressInput = document.getElementById("address");
const photoInput = document.getElementById("photo");
const displayName = document.getElementById("displayName");
const displayCourse = document.getElementById("displayCourse");
const displayRollNo = document.getElementById("displayRollNo");
const displayDuration = document.getElementById("displayDuration");
const displayDob = document.getElementById("displayDob");
const displayBloodGroup = document.getElementById("displayBloodGroup");
const displayContactNo = document.getElementById("displayContactNo");
const displayAddress = document.getElementById("displayAddress");
const photoPlaceholder = document.getElementById("photoPlaceholder");
const downloadFrontBtn = document.getElementById("downloadFront");
const downloadBackBtn = document.getElementById("downloadBack");
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing app...");
  showLoading(false);
  showHomePage();
  setTimeout(() => {
    if (window.auth && window.db) {
      console.log("Firebase loaded successfully");
      initializeAuth();
      loadCollegeSettings();
    } else {
      console.error("Firebase failed to load, continuing without auth");
    }
    setupEventListeners();
  }, 1000);
});
function initializeAuth() {
  console.log("Initializing authentication...");
  try {
    window.onAuthStateChanged(window.auth, async (user) => {
      console.log("Auth state changed:", user ? "logged in" : "logged out");
      if (user) {
        console.log("User signed in:", user.email);
        showLoading(true);
        if (window.checkAdminStatus && window.handleAdminAuth) {
          if (await window.handleAdminAuth(user)) {
            console.log("Admin user authenticated");
            currentUser = user;
            showLoading(false);
            return;
          }
        }
        const isApproved = await checkApprovedEmail(user.email);
        showLoading(false);
        if (isApproved) {
          console.log("User approved, showing studio");
          currentUser = user;
          userEmailSpan.textContent = user.email;
          showStudioPage();
          await logUserActivity("User Login", `${user.email} signed in`);
        } else {
          console.log("User not approved");
          alert("Your email is not authorized to access this application.");
          await window.signOut(window.auth);
          showHomePage();
        }
      } else {
        console.log("No user, showing home page");
        currentUser = null;
        showHomePage();
        showLoading(false);
      }
    });
  } catch (error) {
    console.error("Error initializing auth:", error);
    showLoading(false);
    showHomePage();
  }
}
async function logUserActivity(action, details) {
  try {
    if (
      currentUser &&
      window.addDoc &&
      window.collection &&
      window.serverTimestamp
    ) {
      await window.addDoc(window.collection(window.db, "activityLogs"), {
        userEmail: currentUser.email,
        action: action,
        details: details,
        timestamp: window.serverTimestamp(),
        isAdmin: false,
      });
    }
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
async function loadCollegeSettings() {
  try {
    console.log("Loading college settings...");
    const settingsDoc = await window.getDoc(
      window.doc(window.db, "settings", "general")
    );
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      updateIdCardWithSettings(settings);
      console.log("College settings applied to ID card");
    } else {
      console.log("No custom settings found, using defaults");
    }
  } catch (error) {
    console.error("Error loading college settings:", error);
  }
}
function updateIdCardWithSettings(settings) {
  const cardCollegeName = document.getElementById("cardCollegeName");
  const cardCollegeSubtitle = document.getElementById("cardCollegeSubtitle");
  const cardCollegeAddress = document.getElementById("cardCollegeAddress");
  const cardCollegeNameEdit = document.getElementById("cardCollegeNameEdit");
  const cardCollegeSubtitleEdit = document.getElementById(
    "cardCollegeSubtitleEdit"
  );
  const cardCollegeAddressEdit = document.getElementById(
    "cardCollegeAddressEdit"
  );
  if (settings.collegeName) {
    const fullName = settings.collegeName.trim();
    let mainName, subtitle;
    if (fullName.includes("Dr.N.G.P.")) {
      mainName = "Dr.N.G.P.";
      subtitle = fullName.replace("Dr.N.G.P.", "").trim();
    } else {
      const maxMainLineChars = 10;
      if (fullName.length <= maxMainLineChars) {
        mainName = fullName;
        subtitle = "";
      } else {
        const words = fullName.split(" ");
        let currentLength = 0;
        let splitIndex = 0;
        for (let i = 0; i < words.length; i++) {
          const wordLength = words[i].length + (i > 0 ? 1 : 0);
          if (currentLength + wordLength <= maxMainLineChars) {
            currentLength += wordLength;
            splitIndex = i + 1;
          } else {
            break;
          }
        }
        if (splitIndex === 0) {
          splitIndex = 1;
        } else if (splitIndex === words.length) {
          splitIndex = Math.max(1, words.length - 1);
        }
        mainName = words.slice(0, splitIndex).join(" ");
        subtitle = words.slice(splitIndex).join(" ");
      }
    }
    if (cardCollegeName) {
      cardCollegeName.textContent = mainName;
      if (subtitle && subtitle.trim()) {
        cardCollegeName.style.marginBottom = "3px";
      } else {
        cardCollegeName.style.marginBottom = "0px";
      }
    }
    if (cardCollegeSubtitle) {
      cardCollegeSubtitle.textContent = subtitle;
      if (subtitle && subtitle.trim()) {
        cardCollegeSubtitle.style.display = "block";
        cardCollegeSubtitle.style.marginTop = "0px";
        cardCollegeSubtitle.style.marginBottom = "2px";
      } else {
        cardCollegeSubtitle.style.display = "none";
      }
    }
    if (cardCollegeNameEdit) cardCollegeNameEdit.value = mainName;
    if (cardCollegeSubtitleEdit) cardCollegeSubtitleEdit.value = subtitle;
  }
}
if (settings.collegeAddress) {
  if (cardCollegeAddress) {
    cardCollegeAddress.innerHTML = settings.collegeAddress.replace(
      /\n/g,
      "<br>"
    );
  }
  if (cardCollegeAddressEdit) {
    cardCollegeAddressEdit.value = settings.collegeAddress;
  }
}
function enableAdminEditMode() {
  console.log("Enabling admin edit mode for ID card");
  const displayElements = document.querySelectorAll(".college-display");
  displayElements.forEach((element) => {
    element.style.display = "none";
  });
  const editElements = document.querySelectorAll(".college-edit");
  editElements.forEach((element) => {
    element.style.display = "block";
  });
  setupRealTimeEditing();
}
function disableAdminEditMode() {
  console.log("Disabling admin edit mode for ID card");
  const displayElements = document.querySelectorAll(".college-display");
  displayElements.forEach((element) => {
    element.style.display = "block";
  });
  const editElements = document.querySelectorAll(".college-edit");
  editElements.forEach((element) => {
    element.style.display = "none";
  });
}
function setupRealTimeEditing() {
  const nameEdit = document.getElementById("cardCollegeNameEdit");
  const subtitleEdit = document.getElementById("cardCollegeSubtitleEdit");
  const addressEdit = document.getElementById("cardCollegeAddressEdit");
  if (nameEdit) {
    nameEdit.addEventListener(
      "input",
      debounce(() => {
        const nameDisplay = document.getElementById("cardCollegeName");
        if (nameDisplay) nameDisplay.textContent = nameEdit.value;
        saveCollegeSettingsFromCard();
      }, 500)
    );
  }
  if (subtitleEdit) {
    subtitleEdit.addEventListener(
      "input",
      debounce(() => {
        const subtitleDisplay = document.getElementById("cardCollegeSubtitle");
        if (subtitleDisplay) subtitleDisplay.textContent = subtitleEdit.value;
        saveCollegeSettingsFromCard();
      }, 500)
    );
  }
  if (addressEdit) {
    addressEdit.addEventListener(
      "input",
      debounce(() => {
        const addressDisplay = document.getElementById("cardCollegeAddress");
        if (addressDisplay)
          addressDisplay.innerHTML = addressEdit.value.replace(/\n/g, "<br>");
        saveCollegeSettingsFromCard();
      }, 500)
    );
  }
}
async function saveCollegeSettingsFromCard() {
  try {
    const nameEdit = document.getElementById("cardCollegeNameEdit");
    const subtitleEdit = document.getElementById("cardCollegeSubtitleEdit");
    const addressEdit = document.getElementById("cardCollegeAddressEdit");
    const collegeName =
      nameEdit && subtitleEdit
        ? `${nameEdit.value} ${subtitleEdit.value}`.trim()
        : nameEdit?.value || "Dr.N.G.P. Arts and Science College";
    const collegeAddress =
      addressEdit?.value ||
      "Dr.N.G.P. - Kalapatti Road,\nCoimbatore - 641 048, Tamilnadu, India.\nPhone : (0422) - 2369100 , 2369253";
    const settings = {
      collegeName: collegeName,
      collegeAddress: collegeAddress,
      updatedAt: window.serverTimestamp(),
      updatedBy: currentUser?.email || "admin",
    };
    await window.setDoc(window.doc(window.db, "settings", "general"), settings);
    const adminCollegeName = document.getElementById("collegeName");
    const adminCollegeAddress = document.getElementById("collegeAddress");
    if (adminCollegeName) adminCollegeName.value = collegeName;
    if (adminCollegeAddress) adminCollegeAddress.value = collegeAddress;
    console.log("College settings auto-saved from ID card");
  } catch (error) {
    console.error("Error auto-saving college settings:", error);
  }
}
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
async function checkApprovedEmail(email) {
  try {
    console.log("Checking approved email for:", email);
    const docRef = window.doc(window.db, "approvedEmails", email);
    const docSnap = await window.getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Email found as document ID (old structure)");
      return true;
    }
    const emailsCollection = window.collection(window.db, "approvedEmails");
    const snapshot = await window.getDocs(emailsCollection);
    let emailFound = false;
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email === email) {
        console.log("Email found in document field (new structure)");
        emailFound = true;
      }
    });
    return emailFound;
  } catch (error) {
    console.error("Error checking approved email:", error);
    return false;
  }
}
function showHomePage() {
  homePage.classList.add("active");
  studioPage.classList.remove("active");
  const adminPage = document.getElementById("adminPage");
  if (adminPage) {
    adminPage.classList.remove("active");
  }
}
//page slow down during converting
function showStudioPage() {
  homePage.classList.remove("active");
  studioPage.classList.add("active");
  const adminPage = document.getElementById("adminPage");
  if (adminPage) {
    adminPage.classList.remove("active");
  }
  disableAdminEditMode();
}
function setupEventListeners() {
  console.log("Setting up event listeners...");
  if (signInBtn) {
    signInBtn.addEventListener("click", handleSignIn);
  }
  if (signOutBtn) {
    signOutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      setTimeout(handleSignOut, 100);
    });
  }
  if (studentForm) {
    studentForm.addEventListener("submit", handleFormSubmit);
  }
  if (photoInput) {
    photoInput.addEventListener("change", handlePhotoUpload);
  }
  if (studentNameInput) {
    studentNameInput.addEventListener("input", updatePreview);
  }
  if (courseInput) {
    courseInput.addEventListener("change", updatePreview);
  }
  if (rollNoInput) {
    rollNoInput.addEventListener("input", updatePreview);
  }
  if (durationInput) {
    durationInput.addEventListener("input", updatePreview);
  }
  if (dobInput) {
    dobInput.addEventListener("change", updatePreview);
  }
  if (bloodGroupInput) {
    bloodGroupInput.addEventListener("change", updatePreview);
  }
  if (contactNoInput) {
    contactNoInput.addEventListener("input", updatePreview);
  }
  if (addressInput) {
    addressInput.addEventListener("input", updatePreview);
  }
  if (downloadFrontBtn) {
    downloadFrontBtn.addEventListener("click", () => downloadCard("front"));
  }
  if (downloadBackBtn) {
    downloadBackBtn.addEventListener("click", () => downloadCard("back"));
  }
  console.log("Event listeners setup complete");
  updatePreview();
}
async function handleSignIn() {
  try {
    console.log("Sign in button clicked");
    showLoading(true);
    if (!window.auth || !window.provider) {
      throw new Error("Firebase not initialized properly");
    }
    const result = await window.signInWithPopup(window.auth, window.provider);
    console.log("Sign in successful:", result.user.email);
  } catch (error) {
    console.error("Sign in error:", error);
    showLoading(false);
    alert("Sign in failed: " + error.message);
  }
}
async function handleSignOut() {
  try {
    console.log("Attempting to sign out...");
    let attempts = 0;
    while ((!window.auth || !window.signOut) && attempts < 50) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    if (!window.auth || !window.signOut) {
      throw new Error("Firebase services not available after waiting");
    }
    console.log("Firebase services ready, signing out...");
    await window.signOut(window.auth);
    currentUser = null;
    if (userEmailSpan) {
      userEmailSpan.textContent = "";
    }
    resetForm();
    showHomePage();
    console.log("User signed out successfully");
  } catch (error) {
    console.error("Sign out error:", error);
    console.error("Error details:", error.message);
    alert(`Error signing out: ${error.message}`);
  }
}
function handleFormSubmit(e) {
  e.preventDefault();
  if (!studentPhotoDataUrl) {
    alert("Please upload a student photo.");
    return;
  }
  generateBarcode();
  enableDownloadButtons();
  const studentName = studentNameInput.value || "Unknown";
  const rollNo = rollNoInput.value || "Unknown";
  logUserActivity(
    "ID Generated",
    `Generated ID for ${studentName} (${rollNo})`
  );
  alert(
    "ID Card generated successfully! You can now download the front and back sides."
  );
}
function handlePhotoUpload(e) {
  const file = e.target.files[0];
  if (file) {
    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size should be less than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      studentPhotoDataUrl = e.target.result;
      updatePhotoPreview();
    };
    reader.readAsDataURL(file);
  }
}
function updatePhotoPreview() {
  if (studentPhotoDataUrl) {
    photoPlaceholder.innerHTML = `<img src="${studentPhotoDataUrl}" alt="Student Photo">`;
  }
}
function updatePreview() {
  const name = studentNameInput.value.toUpperCase() || "STUDENT NAME";
  displayName.textContent = name;
  const course = courseInput.value || "Course Name";
  displayCourse.textContent = course;
  const rollNo = rollNoInput.value || "Roll Number";
  displayRollNo.textContent = rollNo;
  const barcodeRollNoElement = document.getElementById("barcodeRollNo");
  if (barcodeRollNoElement) {
    barcodeRollNoElement.textContent = rollNo;
  }
  const duration = durationInput.value || "Duration";
  displayDuration.textContent = duration;
  const dob = dobInput.value;
  if (dob) {
    const dobDate = new Date(dob);
    const formattedDob = `${dobDate.getDate().toString().padStart(2, "0")}.${(
      dobDate.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}.${dobDate.getFullYear()}`;
    displayDob.textContent = formattedDob;
  } else {
    displayDob.textContent = "DD.MM.YYYY";
  }
  const bloodGroup = bloodGroupInput.value || "Blood Group";
  displayBloodGroup.textContent = bloodGroup;
  const contactNo = contactNoInput.value || "Contact Number";
  displayContactNo.textContent = contactNo;
  const address = addressInput.value || "Student Address";
  displayAddress.textContent = address;
  generateBarcode();
}
function generateBarcode() {
  const rollNo = rollNoInput.value || "231CG049";
  const barcodeElement = document.getElementById("barcode");
  if (barcodeElement && window.JsBarcode) {
    try {
      window.JsBarcode(barcodeElement, rollNo, {
        format: "CODE128",
        width: 1.2,
        height: 50,
        displayValue: false,
        margin: 0,
      });
    } catch (error) {
      console.error("Barcode generation error:", error);
    }
  }
}
async function downloadCard(side) {
  const cardElement =
    side === "front"
      ? document.getElementById("idCardFront")
      : document.getElementById("idCardBack");
  const fileName = side === "front" ? "ID_Card_Front.png" : "ID_Card_Back.png";
  try {
    showLoading(true);
    const canvas = await window.html2canvas(cardElement, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: cardElement.offsetWidth,
      height: cardElement.offsetHeight,
    });
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png", 1.0);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Download error:", error);
    alert("Failed to download the card. Please try again.");
  } finally {
    showLoading(false);
  }
}
function enableDownloadButtons() {
  downloadFrontBtn.disabled = false;
  downloadBackBtn.disabled = false;
}
function showLoading(show) {
  if (show) {
    loadingOverlay.classList.add("active");
  } else {
    loadingOverlay.classList.remove("active");
  }
}
function resetForm() {
  studentForm.reset();
  studentPhotoDataUrl = null;
  photoPlaceholder.innerHTML = "<span>Upload Photo</span>";
  downloadFrontBtn.disabled = true;
  downloadBackBtn.disabled = true;
  displayName.textContent = "STUDENT NAME";
  displayCourse.textContent = "Course Name";
  displayRollNo.textContent = "Roll Number";
  displayDuration.textContent = "Duration";
  displayDob.textContent = "DD.MM.YYYY";
  displayBloodGroup.textContent = "Blood Group";
  displayContactNo.textContent = "Contact Number";
  displayAddress.textContent = "Student Address";
  const barcodeRollNoElement = document.getElementById("barcodeRollNo");
  if (barcodeRollNoElement) {
    barcodeRollNoElement.textContent = "231CG049";
  }
  const barcodeElement = document.getElementById("barcode");
  if (barcodeElement) {
    barcodeElement.innerHTML = "";
  }
}
contactNoInput.addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  e.target.value = value;
});
rollNoInput.addEventListener("input", function (e) {
  e.target.value = e.target.value.toUpperCase();
});
studentNameInput.addEventListener("blur", function (e) {
  const words = e.target.value.toLowerCase().split(" ");
  const properCase = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  e.target.value = properCase;
  updatePreview();
});
document.addEventListener("DOMContentLoaded", function () {
  updatePreview();
  setTimeout(() => {
    generateBarcode();
  }, 500);
});
addressInput.addEventListener("input", function (e) {
  e.target.style.height = "auto";
  e.target.style.height = e.target.scrollHeight + "px";
});
document.querySelectorAll("input, select").forEach((input) => {
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  });
});
function addPageTransition() {
  document.querySelectorAll(".page").forEach((page) => {
    page.style.transition = "opacity 0.3s ease-in-out";
  });
}
addPageTransition();
window.addEventListener(
  "error",
  function (e) {
    if (e.target.tagName === "IMG") {
      console.error("Image loading error:", e.target.src);
      e.target.src =
        "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMyNCA0IDI0IDQgMjAgNEMxNiA0IDE2IDQgMjAgMjhaIiBmaWxsPSIjOUI5Qjk5Ii8+Cjwvc3ZnPgo=";
    }
  },
  true
);
console.log("ID Card Generator initialized successfully!");
window.updateIdCardWithSettings = updateIdCardWithSettings;
window.loadCollegeSettings = loadCollegeSettings;
window.enableAdminEditMode = enableAdminEditMode;
window.disableAdminEditMode = disableAdminEditMode;
