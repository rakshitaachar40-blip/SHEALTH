# SHEALTH — System Architecture

## 1. Overview

SHEALTH is a women's healthcare and wellness web application designed to support symptom tracking, health education, health insights, reminders, and medical consultation preparation.

The application follows a client-server architecture, with a React-based frontend communicating with a Node.js and Express backend.

## 2. Architecture

```text
                  USER
                    |
                    v
             REACT FRONTEND
                    |
                    v
              EXPRESS API
                    |
          +---------+----------+
          |         |          |
          v         v          v
       Symptoms   Reminders   Articles
          |
          v
     Health Insights
          |
          v
     Health Reports

     Optional AI integration
     for configured summaries
```

This is a conceptual overview. Exact data flows and backend endpoints should be verified against the submitted source code.

## 3. Frontend

**Technologies:** React and Vite.

The frontend provides the user interface for the following areas:

* Dashboard
* User registration and login
* Symptom tracking
* Health insights
* Health education
* Reminders
* Doctor support
* SHEALTH Connect prototype

## 4. Backend

**Technologies:** Node.js and Express.

The backend handles application requests and provides API endpoints used by the frontend.

The existing project includes functionality for symptom records, reminders, educational articles, and other application features.

## 5. Data Storage

The existing application uses JSON-file-based persistence.

This is suitable for demonstrating a prototype but should not be assumed to provide the security, scalability, or access-control guarantees required for a production healthcare service.

## 6. AI Integration

The project includes an optional Anthropic API integration for AI-generated summaries.

A future improvement is to use Retrieval-Augmented Generation (RAG), retrieving relevant passages from a curated medical knowledge base before generating educational responses.

Source retrieval, source citations, and medical-content grounding must be verified before being described as implemented features.

## 7. SHEALTH Connect

SHEALTH Connect demonstrates a proposed doctor-discovery and report-sharing workflow.

The current prototype includes sample profiles, filtering controls, identity preferences, consent options, and an appointment preview.

The prototype does not itself provide verified doctor accounts, real appointment booking, or medical-report transmission.

## 8. Privacy and Safety

Health information is sensitive. A production implementation would require appropriate authentication, authorisation, secure storage and transmission, consent enforcement, and audit logging.

AI-generated information should not be presented as a medical diagnosis.

## 9. Future Improvements

Potential improvements include:

* Verified healthcare-professional profiles
* Functional appointment scheduling
* Secure consent-based report sharing
* Curated, medically reviewed health information
* Source-grounded AI responses
* Improved security and access controls
* Virtual consultations through an appropriate provider

These are future development opportunities unless implemented in the submitted version.
