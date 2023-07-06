
<h1 align="center" style="font-family: 'Montserrat', sans-serif; font-size: 72px; color: #3498DB;">
  Pure NodeJS API
</h1>

<p align="center">
  <a href="#-project-overview">Project Overview</a> •
  <a href="#-key-features">Key Features</a> •
  <a href="#-technologies-used">Technologies Used</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-testing">Testing</a>
</p>


## 📄 Project Overview

This project is a comprehensive Node.js API implementation showcasing intermediate skills in pure JavaScript development. It demonstrates expertise in building a API from scratch, utilizing Node.js HTTP server, regex, Test-Driven Development (TDD) approach, and file uploads using streams. 

It's a RESTful API designed to manage tasks. It provides various endpoints to perform CRUD (Create, Read, Update, Delete) operations on tasks. The API is built using pure Node.js, leveraging streams for efficient file uploads and regex to match routes params and query strings. 

## ✨ Key Features

- Task Management: Create, Read, Update, and Delete tasks.
- File Upload: Import tasks from a CSV file using streams for efficient processing.
- Validation: Validate uploaded files as CSV using MIME type check.
- Error Handling: Handle and respond with appropriate error messages for invalid requests.
- Test-Driven Development (TDD): Implement automated tests to ensure functionality and code coverage.

## 🛠 Technologies Used

- JavaScript
- Node.js
- Express.js
- Busboy (for facilitating the parsing of multipart/form-data)
- CSV Parser (for CSV file parsing)
- Regex (for specific functionalities)
- Vitest (similar to Jest) (for automated testing)

## 📁 Project Structure

- `routes.mjs`: Defines the API routes and their corresponding handlers. Utilizes the TaskUseCase class to interact with the database and perform CRUD operations on tasks. Implements file upload functionality using the Busboy library to facilitate the parsing of multipart/form-data.
- `server.mjs`: Initializes the HTTP server, sets up routes, and starts listening for incoming requests. Interacts with the Database class to establish a connection and handle database operations.
- `database.mjs`: Implements the Database class responsible for bootstrapping the database connection.
- `middlewares/json-middleware.mjs`: Provides middleware to parse JSON data in incoming requests.
- `use-cases/TaskUseCase.mjs`: Implements the TaskUseCase class responsible for handling business logic related to tasks.

## ⚙️ Installation

1. Clone the repository: `git clone https://github.com/andrevks/pure-nodejs-api.git`
2. Navigate to the project directory: `cd pure-nodejs-api`
3. Install dependencies: `npm install`

## 🖥 Usage

1. Start the API server: `npm run dev`
2. Access the API endpoints using a REST client (e.g., Postman, cURL) on `http://localhost:3333`.

## 🧪 Testing

Automated tests are implemented using the Vitest testing framework, which has a syntax similar to Jest. To run the tests, simply use the command npm test.

---

<p align="center">Made with 💜 by <a href="https://github.com/andrevks">André Geraldo</a></p>
