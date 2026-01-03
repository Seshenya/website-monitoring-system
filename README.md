# Website Monitoring System

## Overview

This project is an **intelligent website monitoring system** that tracks changes on user-specified websites and notifies users via email when **relevant changes** are detected.

Users provide:

- A **website URL**
- A **crawl interval**
- A set of **keywords of interest**

The system periodically crawls the website, detects content changes, evaluates their relevance using **LLMs**, and sends **email notifications** when important updates occur.

---

## How to Run the App

### Configuration
Create a `.env` file referring `.env.example` file and update with your relevant API keys:

```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
GROQ_API_KEY=your_groq_api_key_here
```

### Running Locally

1. _Go to the root directory_:

2. _Start the server_:

   ```sh
   npm install
   npm run start
   ```

3. _Service base URL_:

   - http://localhost:3000

4. _Create a User_:
   - Endpoint: POST http://localhost:3000/api/v1/users
   - Example Request Body:
     ```json
     {
     "name": "Seshenya",
     "company": "Test Company",
     "email": "test@gmail.com",
     }
     ```
     
5. _Create a Monitor Request for a Website_

   - Endpoint: POST http://localhost:3000/api/v1/website
   - Example request body:
     ```json
     {
     "website": "https://example.com/page-to-monitor",
     "timeDiff": 120000, (in ms)
     "keywords": ["sale", "discounts"],
     "userId": "69555107098ca7cc2dc9a97f" (what is returned after creating user)
     }
     ```     
### Sample Website for Testing

A sample website can be run using:

```sh
npm run fe-dev
```

This starts a simple frontend website.
You can modify values in the index.html file to simulate content changes of http://localhost:5000

## Key Features

- 🔍 **Automated Website Crawling**  
  Websites are crawled at user-defined time intervals.

- 📄 **Change Detection**  
  Textual content is extracted and compared with the previously stored version to detect meaningful changes.

- 🧠 **LLM-powered Change Analysis**  
  Large Language Models (LLMs) are used to:

  - Summarize detected changes prioritizing user-defined keywords, but not limited to them alone.

- 🎯 **Relevance Scoring**  
  A relevance score (0.0 – 1.0) is computed based on the summary and the provided keywords.

- 🔁 **Retry Mechanism**  
  The system retries the evaluation **up to 3 times** before rejecting the change.

- 📧 **Email Notifications**  
  Users receive an email notification when the relevance score exceeds the threshold.

---
