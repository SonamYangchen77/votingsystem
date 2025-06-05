document.addEventListener("DOMContentLoaded", () => {
    console.log("JavaScript Loaded!");
});
document.addEventListener("DOMContentLoaded", function () {
    const signupModal = document.getElementById("signupModal");
    const openBtn = document.getElementById("openSignup");
    const closeBtn = document.getElementById("closeSignup");
  
    openBtn.onclick = () => signupModal.style.display = "block";
    closeBtn.onclick = () => signupModal.style.display = "none";
    window.onclick = e => {
      if (e.target === signupModal) {
        signupModal.style.display = "none";
      }
    };
  });
  