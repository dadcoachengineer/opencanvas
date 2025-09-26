# Opencanvas
Open source multiplayer generative interface canvas platform for agentic ops

# 1) Clone the repo
git clone https://github.com/dadcoachengineer/opencanvas.git
cd opencanvas

# 2) Copy Environment File
cp .env.example .env
Edit .env and set:
	•	DOCKERHUB_USERNAME=<your-dockerhub-username>
	•	Any API keys you want to use (OpenAI, Anthropic, Meraki, Splunk, ServiceNow, etc.)

# 3) Build and Run Locally
If you want to build from source:

docker compose up --build

This will build and start:
	•	server → http://localhost:5057
	•	client → http://localhost:8080

# 4) Run Using Prebuilt Images
docker compose pull
docker compose up -d

# 5) Access the App
	•	Open your browser → http://localhost:8080 (client UI)
	•	Server API → http://localhost:5057/health
