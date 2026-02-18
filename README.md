# 🛡️ RAKSHAK - Browser-Based Distress Detection System

> **Automatic distress detection using AI-powered voice, scream, gesture, and behavioral analysis**

[![Production Ready](https://img.shields.io/badge/status-production--ready-success)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://rakshak.app)

---

## 🌟 Overview

RAKSHAK is a **browser-based safety system** that automatically detects distress situations using multiple AI sensors and silently alerts guardians without requiring manual activation. Perfect for workplace safety, vulnerable individuals, and emergency situations where calling for help isn't possible.

### 🎯 Key Features

✅ **4 Detection Methods**
- 🎤 **Voice Keyword Detection** (TensorFlow.js + Web Speech API fallback)
- 🔊 **Scream Detection** (Audio energy + pitch analysis)
- ✋ **Hand Gesture Recognition** (MediaPipe Hands)
- 🖱️ **Behavioral Anomaly Detection** (Statistical pattern analysis)

✅ **False Alert Prevention**
- Triple confirmation strategies
- 5-second cancel window
- 30-second cooldown per detection type
- Combined detection for high-confidence scenarios

✅ **Production Features**
- 💾 Local persistence (IndexedDB)
- 🔄 Auto-retry with exponential backoff
- 👁️ Tab visibility handling
- 🔒 Privacy-first architecture
- 📧 Email notifications via AWS SES
- 📍 Geolocation tracking

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+ (backend)
- AWS account (for backend)
- MongoDB Atlas cluster

### Installation

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/Kavach.AI.git
cd Kavach.AI
```

#### 2. Frontend Setup
```bash
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with AWS credentials
python run_local.py
```

#### 4. Open Browser
```
http://localhost:5173
```

---

## 📁 Project Structure

```
Kavach.AI/
├── src/
│   ├── hooks/                     # Detection & utility hooks
│   │   ├── useVoiceDetection.js   # Dual-layer voice detection
│   │   ├── useScreamDetection.js  # Audio analysis
│   │   ├── useGestureDetection.js # Hand gesture recognition
│   │   ├── useBehaviorDetection.js # Anomaly detection
│   │   ├── useLocalDetectionStore.js # IndexedDB persistence
│   │   └── useAlertConfirmation.js # False alert prevention
│   ├── pages/
│   │   └── dashboard/
│   │       └── LiveProtection.jsx # Main detection page
│   └── services/
│       └── api.js                 # Backend API client
├── backend/
│   ├── routes/                    # API endpoints
│   ├── utils/                     # JWT, SES, S3 utilities
│   └── db.py                      # MongoDB connection
├── DEMO_GUIDE.md                  # Hackathon demo instructions
├── TECHNICAL_GUIDE.md             # Implementation details
└── TESTING_GUIDE.md               # Testing procedures
```

---

## 🎤 Detection Methods

### 1. Voice Keyword Detection

**How it works:**
- Listens for keywords: **"help"**, **"stop"**
- Primary: TensorFlow.js Speech Commands (18-word vocabulary)
- Fallback: Web Speech API (if model fails to load)
- Confidence threshold: 70%

**Demo:**
```
Say "help" near your laptop microphone
→ Detection logged
→ 5-second cancel window
→ Alert sent to guardians (if not cancelled)
```

---

### 2. Scream Detection

**How it works:**
- Analyzes audio energy (RMS) + frequency distribution
- Detects sustained high-energy, high-pitch patterns
- Thresholds:
  - RMS ≥ 0.15
  - High-frequency ratio ≥ 40% (1-4 kHz)
  - Sustain ≥ 500ms

**Demo:**
```
Make a loud, sustained scream sound
→ Detection logged with confidence score
→ Same confirmation flow
```

---

### 3. Hand Gesture Recognition

**How it works:**
- MediaPipe Hands tracks 21 hand landmarks
- Detects: Open palm (all 5 fingers extended)
- Must sustain for 2 seconds
- Throttled to 10 FPS for performance

**Demo:**
```
Raise open palm in front of camera
Hold steady for 2 seconds
→ "✋ Hand detected" indicator
→ Detection triggers
```

---

### 4. Behavioral Anomaly Detection

**How it works:**
- Tracks mouse, keyboard, scroll behavior
- Calculates statistical z-scores for 5 features:
  - Mouse speed & acceleration
  - Scroll intensity
  - Sudden inactivity
  - Panic key presses
- Anomaly threshold: 2.5σ (99% confidence)
- Must sustain for 4 seconds

**Demo:**
```
Rapidly move mouse in erratic patterns
Type keys repeatedly
Scroll frantically
→ Behavior score rises
→ If sustained > 4s, detection triggers
```

---

## 🔐 Security & Privacy

### Client-Side Privacy
- ✅ All AI inference runs locally in browser
- ✅ No recording unless distress confirmed
- ✅ Camera/mic stopped when protection disabled
- ✅ Local storage encrypted via browser

### Backend Security
- ✅ AWS Cognito JWT authentication
- ✅ HTTPS/TLS encryption
- ✅ MongoDB Atlas with encryption at rest
- ✅ SES verified sender emails
- ✅ Input validation on all endpoints

---

## 🎯 False Alert Prevention

### Triple Confirmation Strategy

**1. Dual Detection (within 10 seconds)**
```
2 detections of any type → Immediate alert
```

**2. Combined Signal**
```
Voice + Scream within 10s → Instant alert (no cancel window)
```

**3. Silent Cancel Window**
```
Single detection → 5-second countdown → User can cancel
```

### Cooldown Enforcement
- 30 seconds between alerts per detection type
- Prevents spam and reduces notification fatigue

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────┐
│           Browser (React + Vite)                │
│  ┌──────────────────────────────────────────┐   │
│  │   Live Protection Page                   │   │
│  │  ┌────────┬────────┬────────┬────────┐   │   │
│  │  │ Voice  │ Scream │Gesture │Behavior│   │   │
│  │  └───┬────┴───┬────┴───┬────┴───┬────┘   │   │
│  │      └────────┴────────┴────────┘         │   │
│  │              ▼                             │   │
│  │      Alert Confirmation Engine            │   │
│  │      (3 strategies + cooldown)            │   │
│  │              ▼                             │   │
│  │        IndexedDB Storage                   │   │
│  │        (Local persistence)                 │   │
│  └──────────┬────────────────────────────────┘   │
└─────────────┼────────────────────────────────────┘
              │ HTTPS (JWT Auth)
              ▼
┌─────────────────────────────────────────────────┐
│         AWS Lambda + API Gateway                │
│  ┌──────────────────────────────────────────┐   │
│  │  POST /alert/simulate                    │   │
│  │  ┌────────────────────────────────────┐  │   │
│  │  │ 1. Verify JWT (Cognito)            │  │   │
│  │  │ 2. Save to MongoDB Atlas           │  │   │
│  │  │ 3. Fetch guardians                 │  │   │
│  │  │ 4. Send emails via SES             │  │   │
│  │  │ 5. Upload evidence to S3 (future)  │  │   │
│  │  └────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## 🌐 Backend API

### Endpoints

#### Health Check
```bash
GET /health
Response: {"status": "healthy"}
```

#### Simulate Alert
```bash
POST /alert/simulate
Headers: Authorization: Bearer <JWT>
Body: {
  "detectionType": "voice_distress",
  "confidence": 0.85,
  "location": {"lat": 12.34, "lng": 56.78}
}
Response: {
  "alertId": "...",
  "status": "sent",
  "timestamp": "..."
}
```

#### Get Alert History
```bash
GET /alert/history
Headers: Authorization: Bearer <JWT>
Response: [
  {
    "id": "...",
    "detectionType": "voice_distress",
    "confidence": 0.85,
    "timestamp": "...",
    "status": "sent"
  }
]
```

---

## 🎬 Demo Instructions

For detailed demo flow, see **[DEMO_GUIDE.md](./DEMO_GUIDE.md)**

### Quick Demo (1 minute)
1. **[0:00-0:10]** Login → Live Protection → Enable
2. **[0:10-0:30]** Say "help" → 5s countdown → Alert sent
3. **[0:30-0:50]** Show gesture detection
4. **[0:50-1:00]** Explain system architecture

---

## 🧪 Testing

For comprehensive testing guide, see **[TESTING_GUIDE.md](./TESTING_GUIDE.md)**

### Quick Test
```bash
# 1. Start backend
cd backend && python run_local.py

# 2. Start frontend
npm run dev

# 3. Open browser
http://localhost:5173

# 4. Enable protection and test detections
```

---

## 📦 Configuration

### Environment Variables

#### Frontend (`.env`)
```env
VITE_COGNITO_USER_POOL_ID=ap-southeast-2_pnneeX2EX
VITE_COGNITO_CLIENT_ID=1q8ms3en5pcl9mr9dujgcfsmro
VITE_AWS_REGION=ap-southeast-2
VITE_API_URL=http://localhost:3001
```

#### Backend (`backend/.env`)
```env
MONGODB_URI=mongodb+srv://...
AWS_REGION=ap-southeast-2
SES_SENDER_EMAIL=alerts@rakshak.app
S3_BUCKET=rakshak-evidence
```

---

## 🔧 Development

### Tech Stack

**Frontend:**
- React 18
- Vite
- TensorFlow.js
- MediaPipe Hands
- Axios
- Lucide Icons

**Backend:**
- Python 3.8+
- Flask
- AWS Lambda
- MongoDB Atlas
- AWS Cognito
- AWS SES
- AWS S3

### Key Dependencies
```json
{
  "@tensorflow/tfjs": "^4.22.0",
  "@tensorflow-models/speech-commands": "^0.5.4",
  "@mediapipe/hands": "^0.4.1675469240",
  "react": "^18.3.1",
  "axios": "^1.13.5"
}
```

---

## 📊 Performance

### Expected Resource Usage
- **CPU:** 5-10% idle, 15-25% active detection
- **Memory:** ~150-200 MB
- **Initial Load:** < 5 MB
- **Model Download:** ~3 MB (TensorFlow.js)

### Optimizations
- Gesture detection throttled to 10 FPS
- Audio analysis at 100ms intervals
- Behavioral analysis every 2 seconds
- Tab visibility pause/resume

---

## 🚧 Roadmap

### Current (v1.0) ✅
- [x] Voice, scream, gesture, behavioral detection
- [x] False alert prevention
- [x] Local persistence (IndexedDB)
- [x] AWS backend integration
- [x] Email notifications

### Future (v2.0)
- [ ] Mobile app version (React Native)
- [ ] Evidence recording (audio/video)
- [ ] Real-time guardian tracking
- [ ] Machine learning model training
- [ ] Multi-language support
- [ ] WebRTC peer-to-peer alerts

---

## 🤝 Contributing

Contributions welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

### Code Standards
- React hooks pattern
- JSDoc comments
- Error handling on all async operations
- Memory cleanup on unmount
- Tab visibility handling

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👥 Team

**RAKSHAK** is built by a team passionate about safety and technology.

---

## 🙏 Acknowledgments

- TensorFlow.js team for speech recognition models
- MediaPipe team for hand tracking
- AWS for serverless infrastructure
- MongoDB Atlas for database hosting

---

## 📞 Support

For issues, questions, or demo requests:
- GitHub Issues: [github.com/yourusername/Kavach.AI/issues](https://github.com)
- Email: support@rakshak.app
- Demo: [rakshak.app](https://rakshak.app)

---

## 📚 Documentation

- **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - Hackathon demo instructions
- **[TECHNICAL_GUIDE.md](./TECHNICAL_GUIDE.md)** - Implementation details
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Testing procedures
- **[RAKSHAK_PROJECT_SUMMARY.md](./RAKSHAK_PROJECT_SUMMARY.md)** - Project overview

---

## ⭐ Star Us!

If you find RAKSHAK useful, please consider starring the repository. It helps others discover the project!

---

**Built with ❤️ for safety and security**

**Status:** ✅ **Production Ready** | **Last Updated:** February 2026
