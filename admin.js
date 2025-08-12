let isAdmin = false;
let adminEmails = [];
const adminPage = document.getElementById("adminPage");
const adminEmailSpan = document.getElementById("adminEmail");
const adminSignOutBtn = document.getElementById("adminSignOutBtn");
const adminNavBtns = document.querySelectorAll(".admin-nav-btn");
const adminSections = document.querySelectorAll(".admin-section");
const newEmailInput = document.getElementById("newEmail");
const addEmailBtn = document.getElementById("addEmailBtn");
const refreshEmailsBtn = document.getElementById("refreshEmailsBtn");
const emailsList = document.getElementById("emailsList");
const emailCount = document.getElementById("emailCount");
const bulkImportBtn = document.getElementById("bulkImportBtn");
const csvImport = document.getElementById("csvImport");
const totalIds = document.getElementById("totalIds");
const activeUsers = document.getElementById("activeUsers");
const monthlyIds = document.getElementById("monthlyIds");
const activityList = document.getElementById("activityList");
const collegeName = document.getElementById("collegeName");
const collegeAddress = document.getElementById("collegeAddress");
const requirePhotoUpload = document.getElementById("requirePhotoUpload");
const logActivity = document.getElementById("logActivity");
async function loadAdminEmails() {
  try {
    console.log("Loading admin emails from Firestore...");
    const adminCollection = window.collection(window.db, "adminEmails");
    const snapshot = await window.getDocs(adminCollection);
    adminEmails = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log("Admin document data:", data);
      if (data.email) {
        adminEmails.push(data.email);
      }
    });
    console.log("Loaded admin emails:", adminEmails);
    return adminEmails;
  } catch (error) {
    console.error("Error loading admin emails:", error);
    adminEmails = [
      "231cg022@drngpasc.ac.in",
      "simplysharaj@gmail.com",
      "231cg049@drngpasc.ac.in",
    ];
    console.log("Using fallback admin emails:", adminEmails);
    return adminEmails;
  }
}
async function checkAdminStatus(email) {
  console.log("Checking admin status for:", email);
  if (adminEmails.length === 0) {
    console.log("Admin emails not loaded, loading now...");
    await loadAdminEmails();
  }
  isAdmin = adminEmails.includes(email);
  console.log(`Admin check for ${email}: ${isAdmin}`);
  console.log("Available admin emails:", adminEmails);
  return isAdmin;
}
function showAdminPage() {
  console.log("Showing admin page");
  document
    .querySelectorAll(".page")
    .forEach((page) => page.classList.remove("active"));
  adminPage.classList.add("active");
  loadEmailsList();
  loadAnalytics();
  loadSettings();
}
async function handleAdminAuth(user) {
  console.log("handleAdminAuth called with user:", user?.email);
  if (user && (await checkAdminStatus(user.email))) {
    console.log("Admin user detected:", user.email);
    adminEmailSpan.textContent = user.email;
    if (window.enableAdminEditMode) {
      window.enableAdminEditMode();
    }
    showAdminPage();
    return true;
  }
  console.log("User is not admin or no user provided");
  return false;
}
function setupAdminNavigation() {
  adminNavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const section = btn.dataset.section;
      adminNavBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      adminSections.forEach((s) => s.classList.remove("active"));
      document.getElementById(`${section}Section`).classList.add("active");
    });
  });
}
async function loadEmailsList() {
  try {
    emailsList.innerHTML =
      '<div class="loading-emails">Loading emails...</div>';
    const emailsCollection = window.collection(window.db, "approvedEmails");
    const snapshot = await window.getDocs(emailsCollection);
    const emails = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        emails.push({
          id: doc.id,
          email: data.email,
          addedDate: data.addedDate?.toDate() || new Date(),
        });
      } else if (doc.id && doc.id.includes("@")) {
        emails.push({
          id: doc.id,
          email: doc.id,
          addedDate: new Date(),
        });
      }
    });
    emails.sort((a, b) => b.addedDate - a.addedDate);
    displayEmailsList(emails);
    emailCount.textContent = emails.length;
  } catch (error) {
    console.error("Error loading emails:", error);
    emailsList.innerHTML =
      '<div class="loading-emails">Error loading emails</div>';
  }
}
function displayEmailsList(emails) {
  if (emails.length === 0) {
    emailsList.innerHTML = '<div class="loading-emails">No emails found</div>';
    return;
  }
  const emailsHTML = emails
    .map(
      (emailData) => `
    <div class="email-item">
      <div>
        <div class="email-address">${emailData.email}</div>
        <div class="email-date">Added: ${emailData.addedDate.toLocaleDateString()}</div>
      </div>
      <button class="delete-email-btn" onclick="deleteEmail('${
        emailData.id
      }', '${emailData.email}')">
        Delete
      </button>
    </div>
  `
    )
    .join("");
  emailsList.innerHTML = emailsHTML;
}
async function addEmail() {
  const email = newEmailInput.value.trim();
  if (!email) {
    alert("Please enter an email address");
    return;
  }
  if (!isValidEmail(email)) {
    alert("Please enter a valid email address");
    return;
  }
  try {
    const emailsCollection = window.collection(window.db, "approvedEmails");
    const snapshot = await window.getDocs(emailsCollection);
    let emailExists = false;
    snapshot.forEach((doc) => {
      if (doc.data().email === email) {
        emailExists = true;
      }
    });
    if (emailExists) {
      alert("Email already exists in the approved list");
      return;
    }
    await window.addDoc(emailsCollection, {
      email: email,
      addedDate: window.serverTimestamp(),
      addedBy: currentUser.email,
    });
    await logAdminActivity("Added email", `Added ${email} to approved list`);
    newEmailInput.value = "";
    loadEmailsList();
    alert("Email added successfully!");
  } catch (error) {
    console.error("Error adding email:", error);
    alert("Error adding email. Please try again.");
  }
}
async function deleteEmail(docId, email) {
  if (
    !confirm(`Are you sure you want to remove ${email} from the approved list?`)
  ) {
    return;
  }
  try {
    await window.deleteDoc(window.doc(window.db, "approvedEmails", docId));
    await logAdminActivity(
      "Removed email",
      `Removed ${email} from approved list`
    );
    loadEmailsList();
    alert("Email removed successfully!");
  } catch (error) {
    console.error("Error deleting email:", error);
    alert("Error removing email. Please try again.");
  }
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function handleCSVImport() {
  csvImport.click();
}
function processCSVFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function (e) {
    const csv = e.target.result;
    const lines = csv.split("\n");
    const emails = [];
    lines.forEach((line) => {
      const email = line.trim();
      if (email && isValidEmail(email)) {
        emails.push(email);
      }
    });
    if (emails.length === 0) {
      alert("No valid emails found in CSV file");
      return;
    }
    const added = await addMultipleEmails(emails);
    alert(`Successfully added ${added} emails from CSV`);
    loadEmailsList();
  };
  reader.readAsText(file);
  event.target.value = "";
}
async function addMultipleEmails(emails) {
  let added = 0;
  const emailsCollection = window.collection(window.db, "approvedEmails");
  const snapshot = await window.getDocs(emailsCollection);
  const existingEmails = new Set();
  snapshot.forEach((doc) => {
    existingEmails.add(doc.data().email);
  });
  for (const email of emails) {
    if (!existingEmails.has(email)) {
      try {
        await window.addDoc(emailsCollection, {
          email: email,
          addedDate: window.serverTimestamp(),
          addedBy: currentUser.email,
        });
        added++;
        existingEmails.add(email);
      } catch (error) {
        console.error("Error adding email:", email, error);
      }
    }
  }
  if (added > 0) {
    await logAdminActivity(
      "Bulk import",
      `Added ${added} emails via CSV import`
    );
  }
  return added;
}
async function loadAnalytics() {
  try {
    const logsCollection = window.collection(window.db, "activityLogs");
    const logsQuery = window.query(
      logsCollection,
      window.orderBy("timestamp", "desc"),
      window.limit(100)
    );
    const logsSnapshot = await window.getDocs(logsQuery);
    const activities = [];
    const userSet = new Set();
    let monthlyCount = 0;
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    logsSnapshot.forEach((doc) => {
      const data = doc.data();
      activities.push({
        user: data.userEmail,
        action: data.action,
        details: data.details,
        timestamp: data.timestamp?.toDate() || new Date(),
      });
      userSet.add(data.userEmail);
      const activityDate = data.timestamp?.toDate() || new Date();
      if (
        activityDate.getMonth() === currentMonth &&
        activityDate.getFullYear() === currentYear
      ) {
        if (data.action === "ID Generated") {
          monthlyCount++;
        }
      }
    });
    const totalGenerated = activities.filter(
      (a) => a.action === "ID Generated"
    ).length;
    totalIds.textContent = totalGenerated;
    activeUsers.textContent = userSet.size;
    monthlyIds.textContent = monthlyCount;
    displayRecentActivity(activities.slice(0, 10));
  } catch (error) {
    console.error("Error loading analytics:", error);
    activityList.innerHTML =
      '<div class="loading-activity">Error loading analytics</div>';
  }
}
function displayRecentActivity(activities) {
  if (activities.length === 0) {
    activityList.innerHTML =
      '<div class="loading-activity">No recent activity</div>';
    return;
  }
  const activitiesHTML = activities
    .map(
      (activity) => `
    <div class="activity-item">
      <div class="activity-details">
        <div class="activity-user">${activity.user}</div>
        <div class="activity-action">${activity.action}: ${
        activity.details
      }</div>
      </div>
      <div class="activity-time">${formatRelativeTime(activity.timestamp)}</div>
    </div>
  `
    )
    .join("");
  activityList.innerHTML = activitiesHTML;
}
function formatRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
async function loadSettings() {
  try {
    const settingsDoc = await window.getDoc(
      window.doc(window.db, "settings", "general")
    );
    if (settingsDoc.exists()) {
      const settings = settingsDoc.data();
      collegeName.value =
        settings.collegeName || "Dr.N.G.P. Arts and Science College";
      collegeAddress.value =
        settings.collegeAddress ||
        "Kalapatti Road, Coimbatore - 641 048, Tamil Nadu, India";
      requirePhotoUpload.checked = settings.requirePhotoUpload !== false;
      logActivity.checked = settings.logActivity !== false;
    }
  } catch (error) {
    console.error("Error loading settings:", error);
  }
}
async function saveSettings() {
  try {
    const settings = {
      collegeName: collegeName.value,
      collegeAddress: collegeAddress.value,
      requirePhotoUpload: requirePhotoUpload.checked,
      logActivity: logActivity.checked,
      updatedAt: window.serverTimestamp(),
      updatedBy: currentUser.email,
    };
    await window.setDoc(window.doc(window.db, "settings", "general"), settings);
    if (window.updateIdCardWithSettings) {
      window.updateIdCardWithSettings(settings);
    }
    await logAdminActivity("Updated settings", "Modified system settings");
    alert("Settings saved successfully!");
  } catch (error) {
    console.error("Error saving settings:", error);
    alert("Error saving settings. Please try again.");
  }
}
async function logAdminActivity(action, details) {
  try {
    await window.addDoc(window.collection(window.db, "activityLogs"), {
      userEmail: currentUser.email,
      action: action,
      details: details,
      timestamp: window.serverTimestamp(),
      isAdmin: true,
    });
  } catch (error) {
    console.error("Error logging activity:", error);
  }
}
function setupAdminEventListeners() {
  if (addEmailBtn) {
    addEmailBtn.addEventListener("click", addEmail);
  }
  if (newEmailInput) {
    newEmailInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        addEmail();
      }
    });
  }
  if (refreshEmailsBtn) {
    refreshEmailsBtn.addEventListener("click", loadEmailsList);
  }
  if (bulkImportBtn) {
    bulkImportBtn.addEventListener("click", handleCSVImport);
  }
  if (csvImport) {
    csvImport.addEventListener("change", processCSVFile);
  }
  if (adminSignOutBtn) {
    adminSignOutBtn.addEventListener("click", async () => {
      try {
        await window.signOut(window.auth);
        isAdmin = false;
        showHomePage();
      } catch (error) {
        console.error("Admin sign out error:", error);
      }
    });
  }
  if (collegeName) collegeName.addEventListener("change", saveSettings);
  if (collegeAddress) collegeAddress.addEventListener("change", saveSettings);
  if (requirePhotoUpload)
    requirePhotoUpload.addEventListener("change", saveSettings);
  if (logActivity) logActivity.addEventListener("change", saveSettings);
  setupAdminNavigation();
}
window.deleteEmail = deleteEmail;
window.checkAdminStatus = checkAdminStatus;
window.handleAdminAuth = handleAdminAuth;
window.showAdminPage = showAdminPage;
window.setupAdminEventListeners = setupAdminEventListeners;
window.loadAdminEmails = loadAdminEmails;
document.addEventListener("DOMContentLoaded", () => {
  setupAdminEventListeners();
  loadAdminEmails();
});
