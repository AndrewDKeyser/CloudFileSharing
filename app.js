const fileInput   = document.getElementById("fileInput");
const uploadBtn   = document.getElementById("uploadBtn");
const fileSelect  = document.getElementById("fileSelect");
const downloadBtn = document.getElementById("downloadBtn");
const linkBox     = document.getElementById("linkBox");
const shareLink   = document.getElementById("shareLink");
const copyBtn     = document.getElementById("copyBtn");
const status      = document.getElementById("status");
 
// Load file list on page load
async function loadFiles() {
  try {
    const res = await fetch("/files");
    const files = await res.json();
 
    fileSelect.innerHTML = '<option value="">-- select a file --</option>';
 
    files.forEach((file) => {
      const opt = document.createElement("option");
      opt.value = file.path;
      opt.textContent = `${file.name} (${formatSize(file.size)})`;
      fileSelect.appendChild(opt);
    });
  } catch (err) {
    status.textContent = "Could not load files from bucket.";
  }
}
 
// Correctly show file size in file selection
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
 
// Upload
uploadBtn.addEventListener("click", () => fileInput.click());
 
fileInput.addEventListener("change", async () => {
  const file = fileInput.files[0];
  if (!file) return;
 
  const formData = new FormData();
  formData.append("file", file);

  linkBox.hidden = true;
 
  try {
    const res = await fetch("/upload", { method: "POST", body: formData });
    const data = await res.json();
 
    if (res.ok) {
      status.textContent = `Uploaded: ${data.fileName}`;
      await loadFiles(); // refresh the dropdown
    } else {
      status.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    status.textContent = "Upload failed.";
  }
 
  fileInput.value = "";
});
 
// Download (generate shareable link)
downloadBtn.addEventListener("click", async () => {
  const filePath = fileSelect.value;
  if (!filePath) {
    status.textContent = "Please select a file first.";
    return;
  }
  
  linkBox.hidden = true;
 
  try {
    const res = await fetch("/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: filePath }),
    });
    const data = await res.json();
 
    if (res.ok) {
      shareLink.href = data.url;
      shareLink.textContent = data.url;
      linkBox.hidden = false;
    } else {
      status.textContent = `Error: ${data.error}`;
    }
  } catch (err) {
    status.textContent = "Failed to generate link.";
  }
});
 
// Copy link to clipboard
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(shareLink.href).then(() => {
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
  });
});
 
// Init, so files are loaded on page load
loadFiles();
