# SHEALTH — Testing and Limitations

## 1. Purpose

This document describes the testing approach for SHEALTH, a women's healthcare and wellness prototype.

Testing should confirm that the application's core workflows behave as expected, that errors are handled appropriately, and that the interface communicates its limitations clearly.

## 2. Functional Testing Checklist

The core SHEALTH application has been tested. SHEALTH Connect remains pending integration and verification.

| Feature                | Test performed                                                           | Status                            |
| ---------------------- | ------------------------------------------------------------------------ | --------------------------------- |
| Registration and login | Verified account flows                                                   | ✅ Tested                          |
| Dashboard              | Verified page loading and navigation                                     | ✅ Tested                          |
| Symptom tracking       | Verified symptom recording and history                                   | ✅ Tested                          |
| Health insights        | Verified presentation of recorded information                            | ✅ Tested                          |
| Health education       | Verified article loading and display                                     | ✅ Tested                          |
| Reminders              | Verified reminder functionality                                          | ✅ Tested                          |
| Doctor support         | Verified consultation preparation content                                | ✅ Tested                          |
| PDF report             | Verified report generation                                               | ✅ Tested                          |
| AI integration         | Verified configured AI functionality                                     | ✅ Tested                          |
| SHEALTH Connect        | Integration, search, filters, consent interface, and appointment preview | ⏳ Pending integration and testing |

The statuses above reflect the team's reported testing results. SHEALTH Connect should be marked as tested only after its integration and relevant checks are completed.


## 3. Privacy and Security Checks

Before any real deployment, the team should evaluate:

* Whether users can access only information they are authorised to view.
* Whether credentials and API keys are kept out of source control.
* Whether sensitive information is protected during transmission and storage.
* Whether consent choices are enforced by the backend.
* Whether errors reveal sensitive information.
* Whether personal information is retained only as necessary.

These checks are not a substitute for a professional security assessment.

## 4. Medical Information Checks

Health education and AI-assisted responses should be evaluated for:

* Factual accuracy.
* Appropriate source attribution.
* Clear separation between education and diagnosis.
* Appropriate handling of uncertainty.
* Suitable recommendations to seek professional care.
* Avoidance of unsupported medical claims.

The existence of an AI integration does not establish that its outputs are medically validated.

## 5. Known Limitations

The existing application uses JSON-file-based persistence and should be treated as a prototype rather than a production-ready medical platform.

The SHEALTH Connect prototype demonstrates a proposed interface but does not itself provide real doctor verification, appointment booking, medical-report transmission, or video consultations.

The extent of AI source retrieval, medical-source grounding, and citation support must be verified against the submitted implementation.

## 6. Future Testing Improvements

Potential improvements include:

* Automated frontend and backend tests.
* API integration tests.
* Authentication and authorisation tests.
* Accessibility and usability testing.
* Security testing.
* Medical-content review.
* Evaluation of AI-generated responses.
* Testing with representative users under appropriate privacy safeguards.

## 7. Final Verification

Before submission, record which features were successfully tested, any known defects, and the version of the project that was demonstrated.

Do not mark a feature as passing unless the relevant test has actually been completed.
