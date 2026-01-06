🩺 Dr. Vibe (drvibe.dev)

"Spaghetti code is a treatable condition."

Dr. Vibe is a "vibecoding" diagnostic tool that interacts with the GitHub API to perform a real-time health check on your repository. It analyzes file structure, documentation hygiene, and security risks to prescribe a treatment plan for your codebase.

Launch The Clinic (drvibe.dev)

⚡ Features

Non-Invasive Scan: Uses the public GitHub API. We never clone your code or store your secrets.

The "Vibe Score": A proprietary algorithm (aka simple math) that rates your repo from 0-100 based on bloat, typescript usage, and hygiene.

Instant Prescriptions: Detects missing READMEs, committed .env files, and "Ghost Town" repos.

Cinematic UI: Built with the "Digital Clinic" aesthetic—dark mode, scanlines, and heartbeat animations.

🏥 The Tech Stack

Built for speed and aesthetics:

Core: React (Vite)

Styling: Tailwind CSS

Icons: Lucide React

Vibes: Pure CSS animations (No heavy motion libraries)

🧬 Local Development

Want to run your own clinic? Clone the lab.

# 1. Clone the repo
git clone [https://github.com/your-username/drvibe.git](https://github.com/your-username/drvibe.git)

# 2. Enter the clinic
cd drvibe

# 3. Install surgical tools
npm install

# 4. Open the waiting room
npm run dev


🧪 The Diagnosis Algorithm

Currently, Dr. Vibe scans for:

Bloatware: > 50 files in the root/src triggers a warning.

Documentation: Missing README.md is a critical failure.

Security: Committed .env files trigger an emergency alert.

Hygiene: Checks for lockfiles (package-lock.json or yarn.lock).

🤝 Contributing

The clinic is open to interns. If you want to add new diagnostic rules (e.g., "Check for console.logs" or "Detect generic variable names"):

Fork the repo.

Create your feature branch (git checkout -b feature/new-symptom).

Commit your changes.

Open a Pull Request.

Dr. Vibe is a "Vibecoding" project. It is not real medical advice. If your code hurts, please consult a senior engineer.
