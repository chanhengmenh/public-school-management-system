# Frontend & Backend Integration Setup

## Frontend Routes

### Public Routes
- `/` - Landing page with feature overview
- `/demo` - Interactive assignment submission demo with behavior tracking
- `/login` - User login
- `/register` - User registration

### Protected Routes (Require Authentication)

#### Admin Dashboard (`/admin`)
- Requires role: `admin`
- Features:
  - User management
  - Class management
  - Subject configuration
  - System analytics

#### Teacher Dashboard (`/teacher`)
- Requires role: `teacher` or `home_teacher`
- Features:
  - Assignment management
  - Submission grading
  - Learning resource upload
  - Subject analytics
  - (Home-class teachers get additional class-wide analytics)

#### Student Dashboard (`/student`)
- Requires role: `student` or `class_monitor`
- Features:
  - View assignments
  - Access learning resources
  - Check grades and feedback
  - View rankings
  - Track progress
  - (Class monitors can also manage attendance)

## Setup Instructions

### Backend Setup

1. **Configure PostgreSQL**:
   ```bash
   # Create local PostgreSQL database
   createdb -U postgres iams
   
   # Or use your own database name
   ```

2. **Set environment variables** in `backend/.env`:
   ```dotenv
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/iams
   SECRET_KEY=your-secret-key-min-32-chars
   DEBUG=True
   CORS_ORIGINS=["http://localhost:3000", "http://127.0.0.1:3000"]
   ```

3. **Install dependencies**:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Run the backend** (schema auto-creates on startup):
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`
   - API docs: `http://localhost:8000/docs`

### Frontend Setup

1. **Set environment variables** in `frontend/.env.local`:
   ```dotenv
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Run the frontend**:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`

## API Endpoints

All endpoints are prefixed with `/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and receive JWT token
- `GET /auth/me` - Get current user info
- `POST /auth/logout` - Logout

### Users (Admin)
- `GET /users` - List all users
- `GET /users/{user_id}` - Get user details
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

### Classes (Admin/Teacher)
- `GET /classes` - List classes
- `POST /classes` - Create class
- `GET /classes/{class_id}` - Get class details
- `GET /classes/{class_id}/students` - Get class students
- `POST /classes/{class_id}/enroll` - Enroll student

### Subjects (Admin/Teacher)
- `GET /subjects` - List subjects
- `POST /subjects` - Create subject
- `POST /subjects/assign` - Assign subject to class
- `GET /subjects/class/{class_id}` - Get class subjects

### Assignments (Teacher/Student)
- `GET /assignments/class/{class_id}` - Get class assignments
- `POST /assignments` - Create assignment (teacher)
- `POST /assignments/{assignment_id}/submit/text` - Submit text assignment (student)
- `GET /assignments/{assignment_id}/submissions` - Get submissions (teacher)

### Grading (Teacher)
- `POST /grading` - Grade submission
- `GET /grading/student/{student_id}/class/{class_id}` - Get student grades

### Analytics (Teacher/Home-class Teacher)
- `GET /analytics/class/{class_id}/rankings` - Get class rankings
- `GET /analytics/class/{class_id}/analytics` - Get class analytics
- `GET /analytics/student/{student_id}/behavior-analysis` - Get behavior analysis

## Testing the Integration

### 1. Test Registration & Login
```bash
# Open http://localhost:3000/register
# Create an account with role: student, teacher, or admin
# Login with created credentials
```

### 2. Test Role-Based Access
- **Admin**: Login as admin → auto-redirects to `/admin`
- **Teacher**: Login as teacher → auto-redirects to `/teacher`
- **Student**: Login as student → auto-redirects to `/student`

### 3. Test Protected Routes
- Try accessing `/admin` without admin role → redirects to `/`
- Try accessing `/teacher` without teacher role → redirects to `/`
- Try accessing `/student` without student role → redirects to `/`

### 4. Test API Calls
- Open browser DevTools Console
- Login → JWT token stored in localStorage
- All subsequent requests include `Authorization: Bearer <token>` header

## Database Initialization

On first run, the backend automatically:
1. Connects to PostgreSQL
2. Reads `database/schema.sql`
3. Creates all tables and extensions
4. If errors occur (e.g., permission issues), check PostgreSQL logs

To manually apply schema:
```bash
psql -U postgres -d iams -f database/schema.sql
```

## Supabase Deployment (Production)

When ready to deploy:

1. **Create Supabase project**:
   - Go to https://supabase.com
   - Create project and get credentials

2. **Update backend `.env`**:
   ```dotenv
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
   ```

3. **Deploy frontend to Vercel**:
   ```bash
   npm install -g vercel
   vercel
   ```

4. **Deploy backend to Railway or Fly.io**:
   - Instructions in respective platform docs

## Troubleshooting

### Backend won't connect to database
- Check `DATABASE_URL` format
- Verify PostgreSQL is running: `psql -U postgres -c "SELECT 1"`
- Check firewall/network access

### Frontend API calls fail
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is running on port 8000
- Check CORS settings in `backend/.env`

### JWT token issues
- Ensure `SECRET_KEY` is set in `backend/.env`
- Token stored in localStorage after login
- Check browser DevTools → Application → Local Storage

### Tables not created
- Check PostgreSQL user has CREATE permissions
- Review backend logs for schema creation errors
- Manually run schema: `psql -U postgres -d iams -f database/schema.sql`
