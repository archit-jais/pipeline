# Pipeline Bot GUI

A React-based dashboard for the Pipeline Inspection Bot, featuring a live stream and telemetry display.

## Project Structure
- **/src**: Frontend React application (Vite).
- **/backend**: Python bridge server for telemetry and stream processing.

## Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [Python 3](https://www.python.org/)

### 2. Frontend Setup
1. Inside the root directory, install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

### 3. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the bridge server:
   ```bash
   python bridge_server.py
   ```

## Author
Created for the Pipeline Inspection Bot project.
