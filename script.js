/* =========================================================
   CODEASCEND - JAVASCRIPT
   ========================================================= */

/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const problemsContainer = document.getElementById("problemsContainer");

const searchInput = document.getElementById("searchInput");

const topicFilter = document.getElementById("topicFilter");

const difficultyFilter = document.getElementById("difficultyFilter");

const statusFilter = document.getElementById("statusFilter");

const totalProblemsElement = document.getElementById("totalProblems");

const solvedCountElement = document.getElementById("solvedCount");

const progressPercentElement = document.getElementById("progressPercent");

const topicCountElement = document.getElementById("topicCount");

const progressFill = document.getElementById("progressFill");

const progressText = document.getElementById("progressText");

const showingText = document.getElementById("showingText");

const emptyState = document.getElementById("emptyState");

const footerSolved = document.getElementById("footerSolved");

const currentYear = document.getElementById("currentYear");

/* =========================================================
   LOAD SOLVED PROBLEMS
   ========================================================= */

let solvedProblems = [];

try {
  solvedProblems = JSON.parse(localStorage.getItem("solvedProblems")) || [];
} catch (error) {
  solvedProblems = [];
}

/* =========================================================
   GET UNIQUE TOPICS
   ========================================================= */

function getTopics() {
  if (!Array.isArray(problems)) {
    return [];
  }

  return [...new Set(problems.map((problem) => problem.topic))];
}

/* =========================================================
   POPULATE TOPIC FILTER
   ========================================================= */

function populateTopics() {
  if (!topicFilter) {
    return;
  }

  const topics = getTopics();

  topics.forEach((topic) => {
    const option = document.createElement("option");

    option.value = topic;

    option.textContent = topic;

    topicFilter.appendChild(option);
  });
}

/* =========================================================
   UPDATE STATS
   ========================================================= */

function updateStats() {
  if (!Array.isArray(problems)) {
    return;
  }

  const total = problems.length;

  const solved = solvedProblems.length;

  const percentage = total === 0 ? 0 : Math.round((solved / total) * 100);

  if (totalProblemsElement) {
    totalProblemsElement.textContent = total;
  }

  if (solvedCountElement) {
    solvedCountElement.textContent = solved;
  }

  if (progressPercentElement) {
    progressPercentElement.textContent = `${percentage}%`;
  }

  if (topicCountElement) {
    topicCountElement.textContent = getTopics().length;
  }

  if (progressText) {
    progressText.textContent = `${solved} / ${total} solved`;
  }

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
  }

  if (footerSolved) {
    footerSolved.textContent = solved;
  }
}

/* =========================================================
   FILTER PROBLEMS
   ========================================================= */

function getFilteredProblems() {
  if (!Array.isArray(problems)) {
    return [];
  }

  const searchValue = searchInput ? searchInput.value.toLowerCase().trim() : "";

  const selectedTopic = topicFilter ? topicFilter.value : "all";

  const selectedDifficulty = difficultyFilter ? difficultyFilter.value : "all";

  const selectedStatus = statusFilter ? statusFilter.value : "all";

  return problems.filter((problem) => {
    const problemName = (problem.name || problem.title || "").toLowerCase();

    const problemTopic = (problem.topic || "").toLowerCase();

    /* ================================================
         SEARCH
         ================================================ */

    const matchesSearch =
      !searchValue ||
      problemName.includes(searchValue) ||
      problemTopic.includes(searchValue);

    /* ================================================
         TOPIC FILTER
         ================================================ */

    const matchesTopic =
      selectedTopic === "all" ||
      selectedTopic === "All" ||
      problem.topic === selectedTopic;

    /* ================================================
         DIFFICULTY FILTER
         ================================================ */

    const matchesDifficulty =
      selectedDifficulty === "all" ||
      selectedDifficulty === "All" ||
      problem.difficulty === selectedDifficulty;

    /* ================================================
         SOLVED STATUS
         ================================================ */

    const isSolved = solvedProblems.includes(problem.id);

    let matchesStatus = true;

    if (selectedStatus === "solved" || selectedStatus === "Solved") {
      matchesStatus = isSolved;
    }

    if (selectedStatus === "unsolved" || selectedStatus === "Unsolved") {
      matchesStatus = !isSolved;
    }

    return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
  });
}

/* =========================================================
   RENDER PROBLEMS
   ========================================================= */

function renderProblems() {
  if (!problemsContainer) {
    return;
  }

  const filteredProblems = getFilteredProblems();

  problemsContainer.innerHTML = "";

  /* =======================================================
     SHOWING TEXT
     ======================================================= */

  if (showingText) {
    showingText.textContent = `Showing ${filteredProblems.length} of ${problems.length} problems`;
  }

  /* =======================================================
     EMPTY STATE
     ======================================================= */

  if (filteredProblems.length === 0) {
    if (emptyState) {
      emptyState.classList.remove("hidden");
    }

    return;
  }

  if (emptyState) {
    emptyState.classList.add("hidden");
  }

  /* =======================================================
     GROUP PROBLEMS BY TOPIC
     ======================================================= */

  const groupedProblems = {};

  filteredProblems.forEach((problem) => {
    if (!groupedProblems[problem.topic]) {
      groupedProblems[problem.topic] = [];
    }

    groupedProblems[problem.topic].push(problem);
  });

  /* =======================================================
     TOPIC ORDER
     ======================================================= */

  const allTopics = getTopics();

  Object.keys(groupedProblems).forEach((topic) => {
    const topicIndex = allTopics.indexOf(topic) + 1;

    const topicBlock = document.createElement("div");

    topicBlock.className = "topic-block";

    /* =====================================================
       TOTAL TOPIC PROBLEMS
       ===================================================== */

    const totalTopicProblems = problems.filter(
      (problem) => problem.topic === topic,
    ).length;

    /* =====================================================
       TOPIC HEADER
       ===================================================== */

    topicBlock.innerHTML = `

      <div class="topic-header">

        <div class="topic-title">

          <span class="topic-number">
            ${topicIndex}
          </span>

          <span class="topic-name">
            ${topic}
          </span>

        </div>

        <span class="topic-count">
          ${totalTopicProblems} problems
        </span>

      </div>

    `;

    /* =====================================================
       DIFFICULTIES

       IMPORTANT:
       Easy → Medium → Hard sections will REMAIN.

       But numbering will be generated separately
       in display order so that it stays continuous.
       ===================================================== */

    const difficulties = ["Easy", "Medium", "Hard"];

    /* =====================================================
       CONTINUOUS NUMBER

       This is the MAIN FIX.

       Instead of showing:

       Easy:
       1...10
       24...29
       50

       Medium:
       11...22
       30...46
       51...53

       We display:

       Easy:
       1...13

       Medium:
       14...49

       Hard:
       50...53

       ===================================================== */

    let displayNumber = 1;

    difficulties.forEach((difficulty) => {
      const topicProblems = groupedProblems[topic]
        .filter((problem) => problem.difficulty === difficulty)
        .sort((a, b) => Number(a.number) - Number(b.number));

      /* =================================================
           NO PROBLEMS
           ================================================= */

      if (!topicProblems || topicProblems.length === 0) {
        return;
      }

      /* =================================================
           DIFFICULTY GROUP
           ================================================= */

      const difficultyGroup = document.createElement("div");

      difficultyGroup.className = "difficulty-group";

      /* =================================================
           DIFFICULTY HEADING
           ================================================= */

      difficultyGroup.innerHTML = `

          <div
            class="
              difficulty-heading
              ${difficulty.toLowerCase()}
            "
          >

            <span
              class="
                legend-dot
                ${difficulty.toLowerCase()}-dot
              "
            ></span>

            ${difficulty}
            (${topicProblems.length})

          </div>

        `;

      /* =================================================
           RENDER EACH PROBLEM
           ================================================= */

      topicProblems.forEach((problem) => {
        const isSolved = solvedProblems.includes(problem.id);

        const row = document.createElement("div");

        row.className = `problem-row ${isSolved ? "solved" : ""}`;

        const problemName = problem.name || problem.title || "Untitled Problem";

        const problemLink = problem.link || problem.url || "#";

        /* ==========================================
               IMPORTANT FIX

               DO NOT use:

               problem.number

               for display.

               We use our own continuous
               displayNumber.
               ========================================== */

        const currentNumber = displayNumber;

        displayNumber++;

        row.innerHTML = `

              <div class="problem-index">
                ${currentNumber}
              </div>


              <div class="problem-name">
                ${escapeHTML(problemName)}
              </div>


              <a
                href="${escapeAttribute(problemLink)}"
                target="_blank"
                rel="noopener noreferrer"
                class="solve-link"
              >
                Solve ↗
              </a>


              <input
                type="checkbox"
                class="problem-checkbox"

                data-id="${problem.id}"

                aria-label="Mark ${escapeAttribute(problemName)} as solved"

                ${isSolved ? "checked" : ""}

              />

            `;

        difficultyGroup.appendChild(row);
      });

      /* =================================================
           ADD DIFFICULTY GROUP
           ================================================= */

      topicBlock.appendChild(difficultyGroup);
    });

    /* =====================================================
       ADD TOPIC BLOCK
       ===================================================== */

    problemsContainer.appendChild(topicBlock);
  });
}

/* =========================================================
   CHECKBOX EVENT
   ========================================================= */

document.addEventListener("change", function (event) {
  if (!event.target.classList.contains("problem-checkbox")) {
    return;
  }

  const problemId = Number(event.target.dataset.id);

  /* =====================================================
       SOLVED
       ===================================================== */

  if (event.target.checked) {
    if (!solvedProblems.includes(problemId)) {
      solvedProblems.push(problemId);
    }
  } else {
    /* =====================================================
       UNSOLVED
       ===================================================== */
    solvedProblems = solvedProblems.filter((id) => id !== problemId);
  }

  /* =====================================================
       SAVE
       ===================================================== */

  localStorage.setItem("solvedProblems", JSON.stringify(solvedProblems));

  /* =====================================================
       UPDATE
       ===================================================== */

  updateStats();

  renderProblems();
});

/* =========================================================
   SEARCH EVENT
   ========================================================= */

if (searchInput) {
  searchInput.addEventListener("input", renderProblems);
}

/* =========================================================
   FILTER EVENTS
   ========================================================= */

if (topicFilter) {
  topicFilter.addEventListener("change", renderProblems);
}

if (difficultyFilter) {
  difficultyFilter.addEventListener("change", renderProblems);
}

if (statusFilter) {
  statusFilter.addEventListener("change", renderProblems);
}

/* =========================================================
   NAVBAR ACTIVE LINK
   ========================================================= */

const navLinks = document.querySelectorAll(".nav-link");

navLinks.forEach((link) => {
  link.addEventListener("click", function () {
    navLinks.forEach((item) => {
      item.classList.remove("active");
    });

    this.classList.add("active");
  });
});

/* =========================================================
   UPDATE ACTIVE NAVIGATION
   ========================================================= */

function updateActiveNav() {
  const hash = window.location.hash;

  if (!hash) {
    return;
  }

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (href === hash) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

window.addEventListener("hashchange", updateActiveNav);

/* =========================================================
   FOOTER YEAR
   ========================================================= */

if (currentYear) {
  currentYear.textContent = new Date().getFullYear();
}

/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")

    .replace(/</g, "&lt;")

    .replace(/>/g, "&gt;")

    .replace(/"/g, "&quot;")

    .replace(/'/g, "&#039;");
}

/* =========================================================
   ESCAPE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {
  return escapeHTML(value);
}

/* =========================================================
   INITIALIZE WEBSITE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  populateTopics();

  updateStats();

  renderProblems();

  updateActiveNav();
});

/* =========================================================
   MOBILE MENU
   ========================================================= */

const mobileMenuBtn = document.getElementById("mobileMenuBtn");

const mobileNav = document.querySelector(".nav-links");

if (mobileMenuBtn && mobileNav) {
  /* =====================================================
     OPEN / CLOSE MOBILE MENU
     ===================================================== */

  mobileMenuBtn.addEventListener("click", () => {
    mobileNav.classList.toggle("mobile-active");

    const isOpen = mobileNav.classList.contains("mobile-active");

    mobileMenuBtn.setAttribute("aria-expanded", isOpen);

    const icon = mobileMenuBtn.querySelector("i");

    if (!icon) {
      return;
    }

    if (isOpen) {
      icon.classList.remove("fa-bars");

      icon.classList.add("fa-xmark");
    } else {
      icon.classList.remove("fa-xmark");

      icon.classList.add("fa-bars");
    }
  });

  /* =====================================================
     CLOSE MENU AFTER NAV CLICK
     ===================================================== */

  mobileNav.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("mobile-active");

      mobileMenuBtn.setAttribute("aria-expanded", "false");

      const icon = mobileMenuBtn.querySelector("i");

      if (!icon) {
        return;
      }

      icon.classList.remove("fa-xmark");

      icon.classList.add("fa-bars");
    });
  });
}
