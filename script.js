// Web Certificate Verification System logic
document.addEventListener("DOMContentLoaded", () => {
    // 1. Hook up the search page buttons
    const searchBtn = document.getElementById("search-btn");
    const certInput = document.getElementById("cert-id-input");
    const errorBox = document.getElementById("error-message");
    
    if (searchBtn && certInput) {
        searchBtn.addEventListener("click", () => {
            performSearch();
        });
        
        certInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                performSearch();
            }
        });
    }
    
    function performSearch() {
        const query = certInput.value.trim();
        if (!query) return;
        
        errorBox.classList.add("hidden");
        
        // Load index database
        fetch("certificates.json")
            .then(res => res.json())
            .then(data => {
                const cert = data.find(c => c.id.toLowerCase() === query.toLowerCase());
                if (cert) {
                    // Redirect to verification view
                    window.location.href = `certificate.html?id=${encodeURIComponent(cert.id)}`;
                } else {
                    errorBox.classList.remove("hidden");
                }
            })
            .catch(err => {
                console.error("Error fetching certificates registry:", err);
                errorBox.classList.remove("hidden");
                document.getElementById("error-text").innerText = "Server error loading certificates database.";
            });
    }

    // 2. Load and verify certificate details (Details page view)
    const validCard = document.getElementById("valid-card");
    const invalidCard = document.getElementById("invalid-card");
    
    if (validCard && invalidCard) {
        // Read parameter 'id' from URL query
        const urlParams = new URLSearchParams(window.location.search);
        const certId = urlParams.get("id");
        
        if (!certId) {
            invalidCard.classList.remove("hidden");
            return;
        }
        
        fetch("certificates.json")
            .then(res => res.json())
            .then(data => {
                const cert = data.find(c => c.id.toLowerCase() === certId.toLowerCase());
                if (cert) {
                    // Check if certificate is suspended or pending
                    if (cert.status && cert.status !== "Verified") {
                        showInvalidState();
                        return;
                    }
                    
                    // Display details
                    document.getElementById("student-name").innerText = cert.name;
                    document.getElementById("program-name").innerText = cert.program || "Mentorship Program";
                    document.getElementById("course-name").innerText = cert.course;
                    document.getElementById("cert-id").innerText = cert.id;
                    document.getElementById("issue-date").innerText = cert.issueDate;
                    
                    // Setup PDF viewing and downloads
                    const pdfPath = cert.pdf; // relative path
                    const viewBtn = document.getElementById("view-pdf-btn");
                    const downloadBtn = document.getElementById("download-pdf-btn");
                    
                    if (viewBtn) viewBtn.href = pdfPath;
                    if (downloadBtn) downloadBtn.href = pdfPath;
                    
                    validCard.classList.remove("hidden");
                } else {
                    showInvalidState();
                }
            })
            .catch(err => {
                console.error("Error validating certificate:", err);
                showInvalidState();
            });
            
        function showInvalidState() {
            invalidCard.classList.remove("hidden");
        }
    }
});
