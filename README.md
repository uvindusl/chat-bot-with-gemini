# Jimmy the Robot Chatbot

<img width="930" height="938" alt="Screenshot from 2025-07-19 23-45-16" src="https://github.com/user-attachments/assets/87e088a6-e0cb-420b-9452-7fb1ef930fb0" />

Jimmy the Robot is a friendly chatbot designed to assist users with their queries. This project consists of a Flask-powered backend for processing chatbot logic and a React-based frontend for an interactive user interface. The backend is also containerized using Docker for easy deployment.

## Table of Contents

* [Features](#features)
* [Technologies Used](#technologies-used)
* [Getting Started](#getting-started)
    * [Prerequisites](#prerequisites)
    * [Backend Setup (Flask)](#backend-setup-flask)
    * [Frontend Setup (React)](#frontend-setup-react)
    * [Docker Setup (Backend)](#docker-setup-backend)
* [Usage](#usage)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)

## Features

* **Interactive Chat Interface:** User-friendly React frontend for seamless conversations.
* **Flask Backend:** Robust backend to handle chatbot logic and responses.
* **Conversational Flow:** Demonstrates basic conversational capabilities (greeting, asking about well-being).
* **Dockerized Backend:** Easy deployment and portability of the Flask application using Docker.

## Technologies Used

* **Backend:**
    * Python 3.x
    * Flask
    * Gemini API
* **Frontend:**
    * React
    * JavaScript
    * HTML/CSS
* **Deployment/Containerization:**
    * Docker

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.x**: [Download Python](https://www.python.org/downloads/)
* **Node.js & npm (or yarn)**: [Download Node.js](https://nodejs.org/en/download/) (npm is included)
* **Docker Desktop**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) (if you plan to use Docker)

### Backend Setup (Flask)

1.  **Navigate to the backend directory:**
    ```bash
    cd chat-bot-with-gemini/backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create .env file with Gemini API Key:**
   
    Go to Google Ai Studio and genarate API key and create .env file in the project and add this in your .env file `API_KEY="add api key here"`.

5.  **Run the Flask application:**
    ```bash
    python3 main.py
    ```
    The backend will typically run on `http://127.0.0.1:8000`.

### Frontend Setup (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd chat-bot-with-gemini/frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the React application:**
    ```bash
    npm run dev
    ```

### Docker Setup (Backend)

If you prefer to run the backend using Docker:

1.  **Navigate to the backend directory:**
    ```bash
    cd chat-bot-with-gemini/backend
    ```

2.  **Build the Docker image:**
    ```bash
    docker build -t jimmy-the-robot-backend:tag .
    ```

3.  **Run the Docker container:**
    ```bash
    docker run -p 8000:8000 jimmy-the-robot-backend
    ```

## Usage

1.  Ensure both the Flask backend (either directly or via Docker) and the React frontend are running.
2.  Open your web browser and navigate to `http://localhost:5173`.
3.  You will see the "Jimmy the Robot" chat interface. Type your messages in the input field and click "Send" or press Enter to interact with Jimmy.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
