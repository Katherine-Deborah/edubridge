# 🎓 EduBridge

**EduBridge** is a modern web application built for teachers to track and manage student learning progress. It features dashboards, reflection analysis, session timelines, and built-in tools to export data or send reminders — all within an intuitive interface.

---

## 🛠️ Tech Stack

- **Framework**: Next.js (App Router)
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, PostgreSQL
- **Authentication**: Role-based with custom middleware
- **Data Visualization**: Chart.js (or compatible library)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/edubridge.git
cd edubridge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up PostgreSQL Database

Start the PostgreSQL database using Docker Compose:

```bash
docker-compose up -d
```

This will spin up a PostgreSQL instance configured for the project.

### 4. Configure Environment Variables

Create a `.env` file:

```env
DATABASE_URL=postgresql://your_user:your_password@localhost:5432/edubridge
JWT_SECRET=your_jwt_secret
```

Ensure your PostgreSQL database and schema are ready before running the app.

### 5. Run the Development Server

```bash
npm run dev
```

---

## 🧑‍🏫 Teacher Dashboard Features

### 🔐 Authentication
- Teachers log in through the main page
- "I'm a teacher" toggle directs to the **Teacher Dashboard**

### 🟨 Main Dashboard

#### 🧑‍🎓 Student Progress Table

| Column | Description |
|--------|-------------|
| **Name** | Full name of the student |
| **Session** | Current session being tracked |
| **Status** | Not Started / In Progress / Done |
| **Submitted** | Whether a reflection was added |
| **Last Seen** | Last time the student was active |

**Features:**
- ✅ Sortable & filterable
- ✅ Click to view student details
- ✅ Batch actions for multiple students

#### 📊 Analytics & Insights Panel

- **Completion Rates by Session** (Bar Chart)
- **Average Journal Length** (Line Chart over time)
- **Most Missed Sessions** (Highlight problem areas)
- **Student Engagement Metrics** (Activity heatmap)

**Action Buttons:**
- 🗂️ `Export CSV` - Download student progress data
- 📨 `Send Reminder` - Bulk reminder emails
- 📈 `Generate Report` - Detailed analytics report

### 🟦 Student Detail View

#### 📍 Navigation
```
Dashboard > Students > [Student Name]
```

#### 👤 Student Profile
- Full name, email, enrollment date
- Recent session activity and login history
- Overall progress statistics

#### 📘 Session Timeline
Each session displays:
- ✅ **Completion Status Badge** (Not Started/In Progress/Done)
- ✅ **Reflection Preview & Quality Assessment:**
  - **Brief**: < 50 characters
  - **Good**: 50–200 characters
  - **Detailed**: > 200 characters
- ✅ **Quiz Results** (if available)
- ⚠️ **Flags** for short or incomplete reflections
- 📬 **Individual Actions:** Send reminder, add note

---

## 🧑‍🎓 Student Dashboard Features

### 🔐 Authentication
- Students log in through the main page
- Default view directs to the **Student Dashboard**

### 🟩 Main Dashboard

#### 📚 Learning Progress Overview
- **Current Session**: Active session with progress indicator
- **Completion Status**: Visual progress bar (X/Y sessions completed)
- **Recent Activity**: Timeline of last 5 sessions and reflections
- **Streak Counter**: Consecutive days of activity

#### 📖 Session Cards Grid
Each session card shows:
- ✅ **Session Title** and brief description
- ✅ **Status Badge**: Not Started / In Progress / Completed
- ✅ **Progress Indicator**: Percentage completed within session
- ✅ **Time Estimate**: Expected duration
- ✅ **Quick Actions**: Continue/Start Session button

#### 🎯 Personal Stats
- **Sessions Completed**: Progress toward total completion
- **Average Reflection Length**: Personal writing trends
- **Time Spent Learning**: Total and weekly hours
- **Next Milestone**: Upcoming achievement or goal

### 🟪 Active Session Interface

#### 📍 Navigation
```
Dashboard > Sessions > [Session Name]
```

#### 📋 Session Content
- **Learning Materials**: Rich text, videos, interactive content
- **Progress Tracker**: Step-by-step completion indicators
- **Auto-save**: Continuous progress preservation
- **Bookmark**: Save current position

#### 📝 Reflection Journal
- **Guided Prompts**: Structured questions to aid reflection
- **Rich Text Editor**: Formatting tools for detailed responses
- **Character Counter**: Real-time feedback on reflection length
- **Save Draft**: Ability to save and return later
- **Revision History**: Track reflection improvements

#### 🧠 Knowledge Assessment
- **Interactive Quizzes**: Multiple choice, true/false, short answer
- **Immediate Feedback**: Correct/incorrect with explanations
- **Multiple Attempts**: Retry option for improvement
- **Progress Tracking**: Quiz performance over time

#### ✅ Session Completion
- **Completion Summary**: What was accomplished
- **Reflection Review**: Preview of submitted reflection
- **Next Steps**: Recommended next session
- **Certificate/Badge**: Achievement recognition

---

## 📁 Project Structure

```
/src
 └── app
     ├── api
     │   ├── auth
     │   │   ├── login/route.js
     │   │   └── logout.js
     │   ├── student
     │   │   ├── dashboard/route.js
     │   │   └── session/route.js
     │   └── teacher
     │       ├── dashboard/route.js
     │       ├── student/[id]/route.js
     │       ├── export-csv/route.js
     │       └── send-reminder/route.js
     ├── student
     │   ├── dashboard/page.js
     │   └── session/[id]/page.js
     ├── teacher
     │   ├── dashboard/page.js
     │   └── student/[id]/page.js
/lib
 ├── db.js         # PostgreSQL pool config
 └── auth.js       # withAuth middleware
/db
 └── init.sql
```

---

## 📌 Future Enhancements

- Teacher feedback on student reflections
- Quiz grading and analytics
- Admin role and user permissions
- SMTP email integration
- Enhanced student analytics
- Gamification features (badges, leaderboards)
- Mobile app development
- Real-time notifications

---

## 🤝 Contributing

Contributions are welcome! Open an issue to suggest improvements or submit a pull request.

---

## 📄 License

This project is licensed under the **MIT License**.