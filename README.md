#  Gluco — Blood Glucose Tracker

<p align="center">
  <img src="https://img.shields.io/badge/React-2026-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Django-Backend-092E20?style=for-the-badge&logo=django&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" />
</p>

<p align="center">
  <b>Track Better. Understand Better. Stay Informed.</b>
  <br />
  A full-stack application for tracking blood glucose levels, analyzing trends, and managing daily health records.
</p>

---

## ✨ Overview

**Gluco** is a full-stack blood glucose tracking platform designed to make daily glucose monitoring simple and organized.

With an interactive dashboard, historical reports, personalized tracking ranges, and visual analytics, Gluco helps users understand their glucose patterns and keep their records in one place.

## 🚀 Key Features

| Feature | Description |
|:---|:---|
| 📊 Dashboard | Monitor average, highest, and lowest glucose readings. |
| 🩸 Readings | Add, edit, delete, and manage daily glucose records. |
| 📈 Analytics | Explore glucose trends through interactive charts. |
| 📅 Calendar | Navigate historical readings by date and month. |
| 📋 Daily Reports | Review daily glucose summaries and patterns. |
| 📆 Monthly Reports | Analyze monthly averages and historical trends. |
| 👤 Profile | Manage account details and personal tracking ranges. |
| 🔐 Authentication | Secure login, registration, and JWT authentication. |

## 🛠️ Built With

<p>
  <img src="https://skillicons.dev/icons?i=react,vite,js,tailwind,python,django,postgres,git,github" />
</p>

| Category | Technology |
|:---|:---|
| Frontend | React, Vite, JavaScript |
| Styling | Tailwind CSS |
| Backend | Python, Django |
| API | Django REST Framework |
| Database | PostgreSQL |
| Authentication | JWT / SimpleJWT |
| Charts | Recharts |
| Icons | Lucide React |

## 📸 Application Modules

- **Dashboard** — A centralized overview of glucose readings and statistics.
- **Reading Management** — Four daily tracking slots: Morning (Fasting), After Breakfast, After Lunch, and After Dinner.
- **Reports & Insights** — Daily and monthly analysis with interactive visualizations.
- **Glucose Calendar** — Historical tracking with date-based navigation.
- **Profile Management** — Account information and personalized tracking preferences.

## 📁 Project Structure

```text
glucotracker/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth.jsx
│   │   │   ├── Readings.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   ├── MonthlyReport.jsx
│   │   │   ├── Insights.jsx
│   │   │   ├── GlucoseCalendar.jsx
│   │   │   └── Profile.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   └── package.json
│
├── backend/
│   ├── config/
│   ├── accounts/
│   ├── readings/
│   └── manage.py
│
├── .gitignore
└── README.md
```

## 🛡️ Data Validation & Security

- Glucose readings restricted to 40–600 mg/dL.
- Whole-number glucose values.
- Duplicate date and time-slot prevention.
- Maximum of four readings per day.
- Future-date restrictions.
- JWT-protected API endpoints.
- User-specific record access.
- Environment-based configuration for sensitive credentials.

## 🔮 Future Enhancements

- Downloadable glucose reports.
- Advanced analytics and trend detection.
- Automated testing.
- Production deployment and monitoring.
- Enhanced accessibility.

## ⚠️ Disclaimer

Gluco is an informational tracking and visualization application. It does not provide medical diagnosis or treatment and is not a substitute for professional medical advice.

---

## 👩‍💻 Author

**Sai Priya Neeli**

[![GitHub](https://img.shields.io/badge/GitHub-saipriya240-181717?style=for-the-badge&logo=github)](https://github.com/saipriya240)

