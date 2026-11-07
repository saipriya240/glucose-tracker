\# Gluco – Blood Glucose Tracker



\*\*Gluco\*\* is a full-stack blood glucose tracking application designed to help users record, organize, and understand their glucose readings through a clean and interactive dashboard.



The application allows users to manage daily readings, monitor glucose trends, view reports, explore historical data, and configure personal tracking ranges.



\## Features



\### Authentication

\- User registration and login.

\- JWT-based authentication.

\- Protected user-specific data.

\- Secure access to personal readings and profile information.



\### Dashboard

\- Overview of recorded glucose readings.

\- Average, highest, and lowest glucose values.

\- Visual representation of glucose trends.

\- Configurable glucose target range.



\### Glucose Readings

\- Add, edit, and delete glucose readings.

\- Record readings across four daily time slots:

&#x20; - Morning (Fasting)

&#x20; - After Breakfast

&#x20; - After Lunch

&#x20; - After Dinner

\- View reading history.

\- Validate glucose values and prevent duplicate readings for the same date and time slot.



\### Reports and Analytics

\- Daily glucose reports.

\- Monthly glucose reports.

\- Interactive charts and historical comparisons.

\- Average, highest, and lowest reading analysis.

\- Reading patterns and tracking insights.



\### Glucose Calendar

\- Calendar-based view of historical readings.

\- Visual identification of recorded glucose data.

\- Easy navigation between dates and months.



\### Profile and Preferences

\- View account information.

\- Configure personal glucose tracking ranges.

\- Save preferences to the backend.



\## Tech Stack



| Layer | Technologies |

|---|---|

| Frontend | React, Vite, JavaScript |

| Styling | Tailwind CSS |

| Charts | Recharts |

| Icons | Lucide React |

| Backend | Python, Django |

| API | Django REST Framework |

| Authentication | JWT (SimpleJWT) |

| Database | PostgreSQL |

| API Communication | Fetch API |



\## Project Structure



```text

glucotracker/

│

├── frontend/

│   ├── public/

│   ├── src/

│   │   ├── components/

│   │   │   ├── Auth.jsx

│   │   │   ├── Readings.jsx

│   │   │   ├── DailyReport.jsx

│   │   │   ├── MonthlyReport.jsx

│   │   │   ├── Insights.jsx

│   │   │   ├── GlucoseCalendar.jsx

│   │   │   └── Profile.jsx

│   │   │

│   │   ├── services/

│   │   │   └── api.js

│   │   │

│   │   ├── App.jsx

│   │   ├── main.jsx

│   │   └── index.css

│   │

│   ├── package.json

│   └── vite.config.js

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



\## Getting Started



Follow these instructions to run Gluco locally.



\### Prerequisites



Install the following before starting:



\- Python 3.11+

\- Node.js and npm

\- PostgreSQL

\- Git



\### 1. Clone the Repository



```bash

git clone <YOUR\_GITHUB\_REPOSITORY\_URL>

cd glucotracker

```



\### 2. Backend Setup



Navigate to the backend:



```bash

cd backend

```



Create and activate a virtual environment from the project root if one does not already exist:



```powershell

cd ..

python -m venv .venv

.\\.venv\\Scripts\\Activate.ps1

cd backend

```



Install Python dependencies:



```bash

pip install django djangorestframework django-cors-headers djangorestframework-simplejwt psycopg\[binary] python-dotenv

```



Configure your environment variables and PostgreSQL database according to the Django database settings.



Apply database migrations:



```bash

python manage.py migrate

```



Start the backend server:



```bash

python manage.py runserver

```



Backend runs by default at:



`http://127.0.0.1:8000/`



\### 3. Frontend Setup



Open a second terminal:



```bash

cd frontend

```



Install dependencies:



```bash

npm install

```



Start the development server:



```bash

npm run dev

```



Frontend runs by default at:



`http://localhost:5173/`



\## Application Workflow



1\. Register a new account or log in.

2\. Open the dashboard to view your glucose tracking overview.

3\. Add readings for the available daily time slots.

4\. Review daily and monthly reports.

5\. Explore trends and insights.

6\. Use the calendar to navigate historical readings.

7\. Update your personal tracking range in Profile.



\## Data Validation



Gluco includes validation to maintain consistent reading records:



\- Glucose values must be whole numbers.

\- Accepted reading values are between 40 and 600 mg/dL.

\- A user cannot record duplicate readings for the same date and time slot.

\- A maximum of four readings can be recorded per day.

\- Future dates are restricted.

\- Users can access and manage only their own records.



\## Security



\- JWT-based authentication.

\- Protected API endpoints.

\- User-specific data access.

\- Backend-side validation.

\- Environment-based configuration for sensitive settings.



\*\*Important:\*\* Never commit `.env` files, database passwords, secret keys, or access tokens to GitHub.



\## Future Improvements



Potential enhancements include:



\- Automated test coverage for frontend and backend.

\- Improved authentication and token refresh handling.

\- Data export and downloadable reports.

\- More detailed analytics and visualizations.

\- Deployment and production monitoring.

\- Additional accessibility and responsive design improvements.



\## Disclaimer



Gluco is a personal glucose tracking and data visualization application. Its configured tracking ranges and analytical summaries are for informational purposes only and are not a substitute for professional medical advice, diagnosis, or treatment.



\## Author



\*\*Sai Priya Neeli\*\*



\- GitHub: \[saipriya240](https://github.com/saipriya240)



\---



\*Built with React, Django, and PostgreSQL.\*

