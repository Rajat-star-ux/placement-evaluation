# AI-Powered Placement Preparation & Interview Evaluation System

A comprehensive, production-grade **Final Year Project (FYP)** built to evaluate and improve candidate readiness for technical, HR, and quantitative campus placement interviews.

---

## 🌟 Key Modules & Features

### 1. 🎙️ AI Voice Mock Interviewer Engine
- **Voice Synthesis & Recognition**: Real-time browser-based Web Speech API integration. The AI avatar speaks interview prompts aloud and transcribes candidate spoken answers in real-time.
- **Adaptive Questioning**: Select from multiple technical domains (*Java & Spring Boot, Data Structures & Algorithms, System Design, Behavioral/HR, Quantitative Aptitude*) across various difficulty tiers (*Easy, Medium, Hard*).
- **Multi-Metric Evaluation Engine**:
  - **Technical Accuracy Score (0-100)**: Evaluates semantic alignment with expected keyword structures and reference model solutions.
  - **Communication & Clarity Rating (0-100)**: Assesses sentence structure, vocabulary, and response organization using the STAR framework.
  - **Sentiment & Tone Confidence**: Identifies decisive tone words vs. hesitation markers.
  - **Constructive Feedback & Model Answers**: Provides instant actionable guidance for improvement.

### 2. 📄 AI Resume ATS & Skill Gap Scanner
- **ATS Match Score Meter (0-100%)**: Scans resume text against target job role requirements (*Software Development Engineer, Frontend Developer, Backend Developer, Data Analyst*).
- **Skill Gap Extraction**: Automatically isolates missing high-impact technical keywords and provides actionable resume optimization suggestions.

### 3. 💻 Coding Sandbox & AI Complexity Analyzer
- **Multi-Language Support**: Java 17, Python 3, C++ 20, and JavaScript.
- **Automated Test Suite Runner**: Executes solutions against test cases with execution runtime tracking.
- **AI Complexity Review**: Analyzes code algorithms to detect time complexity ($O(N)$, $O(N^2)$, $O(1)$) and memory usage.

### 4. 🏢 Company Placement Kits
- Pre-packaged interview question archives tailored for top recruiters: **Amazon**, **TCS**, **Infosys**, **Google**, and **Wipro**.

### 5. 📊 Analytics Dashboard & PDF Report Exporter
- Visual metrics breakdown of domain strengths and readiness trends.
- **Automated PDF Exporter**: One-click generation of official performance evaluation reports using `jsPDF` for project review submissions.

---

## 🏗️ System Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────┐
                     │          React + Vite + TS UI            │
                     │  (Voice Speech API + Glassmorphism UI)   │
                     └────────────────────┬─────────────────────┘
                                          │  REST APIs + JWT
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │         Spring Boot 3.3 Backend          │
                     │  (Spring Security, JPA, AI/NLP Engine)   │
                     └────────────────────┬─────────────────────┘
                                          │
                     ┌────────────────────┴─────────────────────┐
                     ▼                                          ▼
        ┌─────────────────────────┐                ┌─────────────────────────┐
        │     MySQL 8.0 Database  │                │    H2 In-Memory DB      │
        │  (Production Container) │                │    (Quick Start Dev)    │
        └─────────────────────────┘                └─────────────────────────┘
```

- **Frontend**: React 18, Vite, TypeScript, Vanilla CSS Glassmorphism Design System, Lucide Icons, jsPDF.
- **Backend**: Java 17, Spring Boot 3.3, Spring Security 6, JJWT (Java JWT), Spring Data JPA, Hibernate.
- **Database**: MySQL 8.0 / H2 Database.
- **Containerization & Deployment**: Docker, Docker Compose, Nginx.

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+)
- Java JDK 17+

### 1. Running the Frontend
```bash
cd frontend
npm install
npm run dev
```
Access the UI in your browser at `http://localhost:5173`.

### 2. Running the Backend
```bash
cd backend
./mvnw spring-boot:run
```
*(The backend defaults to the `dev` profile using H2 database with pre-populated demo data).*

---

## 🐳 Docker Deployment

To launch the full production environment (MySQL + Spring Boot Backend + Nginx React Frontend):

```bash
docker-compose up --build
```

- **Frontend App**: `http://localhost:80`
- **Backend API**: `http://localhost:8080/api`
- **MySQL Database**: `localhost:3306`

---

## 🔐 Credentials & Default Demo Accounts
- **Demo Candidate Login**: `student@fyp.com` / `password123`
