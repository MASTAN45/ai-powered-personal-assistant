# AI-Powered Personal Assistant – Email Management Dashboard

> An intelligent email management system designed for professional assistants to efficiently manage client communications using AI-powered classification, prioritization, and automated workflows.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://github.com/MASTAN45/ai-powered-personal-assistant)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Overview

This full-stack application streamlines email management for busy professionals by leveraging artificial intelligence to automatically classify, prioritize, and suggest actions for incoming emails. The system features separate workspaces for assistants and clients, enabling seamless collaboration and communication management.

**Note:** This is a demonstration project developed for an internship. Email integration is currently simulated using seeded demo data. Actual Gmail/Outlook OAuth integration and live inbox synchronization are planned future enhancements.

## ✨ Key Features

### 🤖 AI-Powered Email Classification
- **Automatic Categorization**: Emails are intelligently classified into:
  - ASSISTANT_TO_REPLY - Requires assistant response
  - CLIENT_TO_REPLY - Awaiting client decision/approval  
  - NO_REPLY_NEEDED - Informational only (FYI)
- **Confidence Scoring**: Each classification includes a confidence percentage
- **Reasoning Transparency**: AI provides explanation for classification decisions
- **Priority Assignment**: Automatic priority levels (LOW, MEDIUM, HIGH, URGENT)

### 👨‍💼 Assistant Workspace
- **Unified Dashboard**: Overview of all client emails and pending tasks
- **Conversation Management**: View, search, and filter email threads
- **AI Reply Drafting**: Generate professional email responses with tone options
- **Deadline Tracking**: Monitor important dates and commitments
- **Activity History**: Complete audit trail of all actions
- **Client Pairing**: Manage relationships with multiple clients
- **Real-time Metrics**: Live dashboard statistics and charts

### 👥 Client Workspace
- **Personal Dashboard**: View email status at a glance
- **Conversation Tracking**: Monitor email threads and response status
- **Deadline Visibility**: Stay informed about important dates
- **Assistant Collaboration**: Seamless communication with assigned assistant
- **Status Overview**: Track email classifications and priorities

### 💬 Intelligent Chatbot
- **Context-Aware Conversations**: Multi-turn dialog with conversation memory
- **Email Summaries**: Quick overviews of pending conversations
- **Urgent Item Detection**: Identify high-priority emails
- **Reply Drafting**: AI-generated professional email templates
- **Action Recommendations**: Suggested next steps
- **Dual AI System**:
  - **Gemini AI** (when API key configured)
  - **Rule-based Fallback** (always available)
- **Session Persistence**: Conversations preserved across page navigation

### 📊 Analytics & Insights
- **Interactive Charts**: Recharts-powered visualizations
- **Classification Distribution**: Pie charts showing email breakdown
- **Priority Analysis**: Bar charts of urgent vs. routine items
- **Trend Tracking**: Historical activity patterns
- **Real-time Metrics**: Live dashboard statistics
- **Red-Yellow-Green Color Coding**: Intuitive priority visualization

### 🔐 Security & Authentication
- **JWT-based Authentication**: Secure token management with httpOnly cookies
- **Role-based Access Control**: Strict separation between assistant and client permissions
- **Session Management**: Secure multi-session support
- **Password Hashing**: bcrypt encryption with salt rounds
- **Protected Routes**: Frontend and backend route guards
- **Action Confirmation**: Two-step verification for write operations
- **Rate Limiting**: Protection against brute force attacks

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18.2 with TypeScript 5.2
- **Routing**: React Router DOM 6.21
- **State Management**: Zustand 4.5
- **API Client**: Axios 1.6 with React Query (TanStack Query 5.14)
- **Styling**: TailwindCSS 3.4 with custom Red-Yellow-Green brand palette
- **UI Components**: Custom components with lucide-react icons
- **Charts**: Recharts 2.10
- **Animations**: Framer Motion 10.16
- **Build Tool**: Vite 5.0

### Backend
- **Runtime**: Node.js 18+ with TypeScript 5.3
- **Framework**: Express 4.18
- **Database**: MongoDB with Mongoose 8.0
- **Authentication**: JSON Web Tokens (jsonwebtoken 9.0)
- **Password Security**: bcryptjs 2.4
- **Validation**: Joi 17.11
- **AI Integration**: Google Generative AI (@google/generative-ai 0.24)
- **Logging**: Winston 3.19 with daily rotation
- **Rate Limiting**: express-rate-limit 7.1

## 📁 Project Structure

\\nai-powered-personal-assistant/
├── backend/
│   ├── src/
│   │   ├── config/              # Database, logger, environment
│   │   ├── controllers/         # Route controllers
│   │   ├── middleware/          # Auth, error handling, validation
│   │   ├── models/              # Mongoose schemas
│   │   ├── routes/              # Express routes
│   │   ├── services/            # Business logic
│   │   │   ├── ai/              # AI services (Gemini, fallback)
│   │   │   ├── auth.service.ts  # Authentication logic
│   │   │   └── ...
│   │   ├── seed/                # Database seeding scripts
│   │   ├── utils/               # Helper functions
│   │   └── server.ts            # Application entry point
│   ├── .env.example             # Environment template
│   ├── vercel.json              # Vercel deployment config
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── features/            # Feature modules
│   │   │   └── chatbot/         # AI chatbot implementation
│   │   ├── layouts/             # Page layouts
│   │   ├── pages/               # Route pages
│   │   ├── services/            # API layer
│   │   ├── stores/              # Zustand state stores
│   │   ├── utils/               # Helper functions
│   │   └── main.tsx             # Application entry
│   ├── vercel.json              # SPA routing config
│   └── package.json
│
├── docs/
│   ├── DEPLOYMENT_GUIDE.md      # Deployment instructions
│   └── screenshots/             # Application screenshots
│
├── .gitignore
├── package.json                 # Workspace configuration
└── README.md
\\n
## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Atlas account or local instance
- **Git**: For version control

### Installation

1. **Clone the Repository**
\ash
git clone https://github.com/MASTAN45/ai-powered-personal-assistant.git
cd ai-powered-personal-assistant
\\n
2. **Install Dependencies**
\ash
# Install all workspace dependencies
npm run install:all

# Or install separately
cd backend && npm install
cd ../frontend && npm install
\\n
### Environment Configuration

1. **Backend Environment** (ackend/.env)

Copy ackend/.env.example to ackend/.env and configure:

\env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-required
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:5173

# AI (Optional - uses fallback if not configured)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-pro
AI_MODE=demo
\\n
**MongoDB Atlas Setup:**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create cluster and get connection string
3. Whitelist your IP address
4. Create database user

**Gemini AI (Optional):**
1. Get API key from https://aistudio.google.com/
2. Add to GEMINI_API_KEY\n3. Set AI_MODE=ai to enable Gemini
4. Leave empty to use rule-based fallback

### Running Locally

**Option 1: Run both servers together**
\ash
npm run dev
\\n
**Option 2: Run separately**

Terminal 1 - Backend:
\ash
npm run dev:backend
# or
cd backend && npm run dev
\\n
Terminal 2 - Frontend:
\ash
npm run dev:frontend  
# or
cd frontend && npm run dev
\\n
Access the application:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/health

### Seed Demo Data

\ash
cd backend
npm run seed
\\n
Creates:
- Demo assistant: demo-assistant@example.com / password123\n- Demo client: demo-client@example.com / password123\n- 14 realistic email conversations
- Pairing relationship

## 🎨 Screenshots

*Screenshots coming soon*

## 🌐 Deployment

### Vercel Deployment

**Backend:**
\ash
cd backend
npm run build
vercel --prod
\\n
Environment Variables (Vercel Dashboard):
\\nNODE_ENV=production
MONGODB_URI=your_production_uri
JWT_SECRET=your_secure_secret
FRONTEND_URL=https://your-frontend.vercel.app
GEMINI_API_KEY=your_key
\\n
**Frontend:**
\ash
cd frontend
vercel --prod
\\n
Environment Variables (Vercel Dashboard):
\\nVITE_API_URL=https://your-backend.vercel.app
\\n
See [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

## ⚠️ Known Limitations

1. **Email Integration**: No actual Gmail/Outlook OAuth - uses simulated data
2. **Email Fetching**: No real-time inbox synchronization
3. **Email Sending**: Reply drafts generated but not sent via SMTP
4. **Attachments**: File handling not implemented
5. **Real-time Updates**: No WebSocket support
6. **Email Threading**: Simulated threads, not actual email headers

## 🔮 Future Improvements

- [ ] Gmail/Outlook OAuth integration
- [ ] Real-time inbox synchronization
- [ ] SMTP email sending
- [ ] File attachment support
- [ ] WebSocket notifications
- [ ] Advanced search filters
- [ ] Email templates library
- [ ] Calendar integration
- [ ] Mobile native apps
- [ ] Bulk operations
- [ ] Custom AI training
- [ ] Multi-language support

## 👨‍💻 Author

**MASTAN45**
- GitHub: [@MASTAN45](https://github.com/MASTAN45)
- Repository: [ai-powered-personal-assistant](https://github.com/MASTAN45/ai-powered-personal-assistant)

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Google Gemini AI for natural language processing
- MongoDB for database hosting
- Vercel for deployment platform
- React and TypeScript communities
- TailwindCSS for styling framework

---

**Built as an internship demonstration project showcasing full-stack development, AI integration, and modern web technologies.**