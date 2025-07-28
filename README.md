# Django Backend + React Frontend with Role-Based Access Control

This project is a full-stack web application built with Django on the backend and React on the frontend. It implements role-based access control (RBAC) to manage user permissions and restrict access to certain features based on user roles.

---

## Project Folder Structure

```
common_project/
  backend/
    authx/
      management/
        commands/
      migrations/
    core/
  frontend/
    public/
    src/
      assets/
      components/
        auth/
        dashboard/
      contexts/
      hooks/
      services/
      types/
  README.md
```

---

## Authx Module

The `authx` module provides authentication and authorization for the backend. It manages user registration, login, logout, and role-based access control (RBAC). The module integrates with Django REST Framework and SimpleJWT for secure token-based authentication.

### Main Features

- User registration and login with JWT authentication
- Role and permission management
- Admin integration for managing users and roles
- API endpoints for authentication and user management
- Permission checks for protected resources

---

## Dynamic Workflow Module (In Progress)

This module enables the creation and execution of dynamic, multi-step workflows with conditional logic and auditing. It is designed to be flexible for business processes that require approvals, reviews, or custom flows.

### Core Features

1. Users can define workflow templates containing multiple steps.
2. Each step is assigned to a user or a role.
3. Steps may have conditional logic (e.g., if some field == value).
4. Each execution of a workflow creates a workflow instance with runtime status.
5. Workflow instances are executed step-by-step by assigned users (approve, reject, comment).
6. All workflow actions are logged for auditing.

### Backend (Django)

- Models: `WorkflowTemplate`, `WorkflowStep`, `WorkflowInstance`, `StepInstance`, `Condition`
- API endpoints (Django REST Framework):
  - Create workflow templates
  - Start workflow instances
  - Execute workflow steps
  - View current status and history
- Logic to move to the next step based on conditions
- Use Django signals or custom services to track workflow progression

### Frontend (React + Vite)

- Form to define workflow templates (name, steps, roles)
- Display current workflow instances with step-by-step status
- For users: show tasks assigned to them and allow them to take action (approve, reject)
- Show history of all actions taken on a workflow instance

---

## Features

- **User Authentication:**
  - Registration
  - Login
  - Logout
  - Token refresh
- **Role-Based Access Control:**
  - Users can be assigned to roles.
  - Roles have associated permissions.
  - Frontend components are protected based on user roles and permissions.
- **Dynamic Workflow Module:**
  - Define, execute, and audit custom workflows with conditional logic and step assignments.

## Technologies Used

- **Backend:**
  - Django
  - Django REST Framework
  - djangorestframework-simplejwt
  - django-cors-headers
  - SQLite (for development)
- **Frontend:**
  - React
  - Vite
  - TypeScript
  - axios
  - js-cookie
  - @tanstack/react-query
  - @mantine/core
  - @mantine/hooks
  - react-router-dom

## Project Tasks

- [x] Initialized Django project and React app with Vite.
- [x] Configured Django REST Framework and JWT authentication.
- [x] Created User model with email, full_name, and roles.
- [x] Implemented registration and login endpoints.
- [x] Created React components for login and registration.
- [x] Implemented AuthContext for managing user authentication state.
- [x] Created ProtectedRoute component for route protection.
- [x] Created useHasPermission hook for checking user permissions.
- [x] Implemented basic role-based access control on the frontend.
- [x] Configured CORS to allow communication between frontend and backend.
- [x] Added MantineProvider to wrap the app.
- [x] Implement user role management in the Django admin panel.
- [x] Implement permission management in the Django admin panel.
- [ ] Create more frontend components and protect them with RBAC.
- [ ] Implement comprehensive testing for backend and frontend.
- [ ] Implement deployment to a production environment.
- [ ] Implement password reset functionality.
- [ ] Implement social authentication (e.g., Google, Facebook).
- [ ] **Dynamic Workflow Module:**
  - Design and implement workflow models and APIs
  - Build frontend UI for workflow definition and execution
  - Implement step-by-step execution and auditing

## Future Plans

- **Enhance RBAC:** Implement more granular permissions and roles.
- **Improve UI/UX:** Enhance the user interface and user experience with more advanced components and styling.
- **Add More Features:** Implement additional features such as user profiles, settings, and notifications.
- **Implement Testing:** Write unit and integration tests for both the backend and frontend to ensure code quality and stability.
- **Deployment:** Deploy the application to a production environment such as Heroku, AWS, or Google Cloud.
- **Expand Workflow Module:** Add advanced conditional logic, notifications, and integrations with other systems.
