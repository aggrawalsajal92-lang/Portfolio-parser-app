/**
 * app.js — Resume Parser Logic
 *
 * Reads whatever the user typed into each field,
 * builds a structured result object, and renders
 * the resume preview card. No field is mandatory —
 * only filled fields appear in the output.
 */

/**
 * Called when user clicks "Parse My Resume".
 * Collects all field values and renders the result.
 */
function buildResume() {
  // Read every field exactly as the user typed it
  const name      = document.getElementById("f-name").value.trim();
  const email     = document.getElementById("f-email").value.trim();
  const phone     = document.getElementById("f-phone").value.trim();
  const skillsRaw = document.getElementById("f-skills").value.trim();
  const education = document.getElementById("f-education").value.trim();
  const summary   = document.getElementById("f-summary").value.trim();

  // Need at least one field filled to do anything
  if (!name && !email && !phone && !skillsRaw && !education && !summary) {
    // Shake the button to hint the user
    const btn = document.querySelector(".btn-primary");
    btn.style.animation = "none";
    btn.offsetHeight; // reflow
    btn.style.animation = "shake 0.3s ease";
    return;
  }

  // Split skills by comma into an array, ignore empty entries
  const skills = skillsRaw
    ? skillsRaw.split(",").map(s => s.trim()).filter(Boolean)
    : [];

  // Build the structured result — only include fields that have a value
  const result = {};
  if (name)      result.name      = name;
  if (email)     result.email     = email;
  if (phone)     result.phone     = phone;
  if (skills.length) result.skills = skills;
  if (education) result.education = education;
  if (summary)   result.summary   = summary;

  renderResult(result);
  setProgress(3);
}

/**
 * Renders the resume preview card on the right panel.
 * Only shows sections that have data.
 */
function renderResult(r) {
  document.getElementById("emptyState").style.display  = "none";
  document.getElementById("resumeCard").style.display  = "block";

  // Name — show placeholder if empty
  document.getElementById("rc-name").textContent = r.name || "—";

  // Email — show/hide the meta chip
  const emailWrap = document.getElementById("rc-email-wrap");
  if (r.email) {
    document.getElementById("rc-email").textContent = r.email;
    emailWrap.style.display = "flex";
  } else {
    emailWrap.style.display = "none";
  }

  // Phone — show/hide the meta chip
  const phoneWrap = document.getElementById("rc-phone-wrap");
  if (r.phone) {
    document.getElementById("rc-phone").textContent = r.phone;
    phoneWrap.style.display = "flex";
  } else {
    phoneWrap.style.display = "none";
  }

  // Summary section
  showSection("sec-summary", "rc-summary", r.summary);

  // Education section
  showSection("sec-education", "rc-education", r.education);

  // Skills section — render as tag pills
  const secSkills = document.getElementById("sec-skills");
  const tagsEl    = document.getElementById("rc-skills");
  if (r.skills && r.skills.length > 0) {
    tagsEl.innerHTML = "";
    r.skills.forEach(function(skill) {
      const t = document.createElement("span");
      t.className   = "tag";
      t.textContent = skill;
      tagsEl.appendChild(t);
    });
    secSkills.style.display = "block";
  } else {
    secSkills.style.display = "none";
  }

  // Store JSON for the toggle view
  document.getElementById("json-block").textContent = JSON.stringify(r, null, 2);
}

/**
 * Helper — shows a section if value exists, hides it otherwise.
 */
function showSection(sectionId, valueId, value) {
  const section = document.getElementById(sectionId);
  if (value) {
    document.getElementById(valueId).textContent = value;
    section.style.display = "block";
  } else {
    section.style.display = "none";
  }
}

/** Toggles the raw JSON output block */
function toggleJSON() {
  const block  = document.getElementById("json-block");
  const toggle = document.getElementById("jsonToggle");
  const show   = block.style.display === "none";
  block.style.display = show ? "block" : "none";
  toggle.textContent  = show ? "✕ Hide raw JSON" : "{} View raw JSON";
}

/** Resets all inputs and the output panel */
function clearForm() {
  ["f-name","f-email","f-phone","f-skills","f-education","f-summary"].forEach(function(id) {
    document.getElementById(id).value = "";
  });
  document.getElementById("emptyState").style.display  = "block";
  document.getElementById("resumeCard").style.display  = "none";
  document.getElementById("json-block").style.display  = "none";
  setProgress(1);
}

/** Updates the 3-step progress bar */
function setProgress(active) {
  [1,2,3].forEach(function(i) {
    const s = document.getElementById("ps" + i);
    s.classList.remove("active","done");
    if (i < active)       s.classList.add("done");
    else if (i === active) s.classList.add("active");
  });
  [1,2].forEach(function(i) {
    document.getElementById("pl" + i).classList.toggle("done", i < active);
  });
}

// Move progress to step 2 as soon as the user starts typing anything
["f-name","f-email","f-phone","f-skills","f-education","f-summary"].forEach(function(id) {
  document.getElementById(id).addEventListener("input", function() {
    // Only advance to step 2 if we're still on step 1
    const s1 = document.getElementById("ps1");
    if (s1.classList.contains("active")) setProgress(2);
  });
});
