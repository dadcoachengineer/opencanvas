# opencanvas
Open source multiplayer generative interface canvas platform for agentic ops

# 1) Clone the repo
https://github.com/<your-username>/ai-canvas-prototype.git
cd ai-canvas-prototype

# 2) Install dependencies
cd app && npm install
cd ../server && npm install

# 3) Run locally
npm run server   # in /server
npm run dev      # in /app

# Or use Docker Compose
cd ..
docker compose up --build
