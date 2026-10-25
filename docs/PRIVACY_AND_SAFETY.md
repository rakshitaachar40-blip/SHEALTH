# SHEALTH — Privacy, Security and Medical Safety

## 1. Why Privacy Matters

Women's health can involve deeply personal experiences, including menstruation, reproductive health, hormonal changes, and symptoms that users may hesitate to discuss openly.

Stigma and fear of judgement can make it difficult for some people to seek information or communicate their concerns.

SHEALTH aims to create a more respectful digital experience in which users can organise their health information and make informed choices about sharing it.

**Our principle: A person's health information deserves dignity, confidentiality, and responsible handling.**

## 2. Privacy by Design

Privacy should be considered throughout the design and development process rather than added as an afterthought.

Our design priorities include:

* Clear explanations of what information the application collects.
* Meaningful choices about sharing health information.
* Appropriate restrictions on access to personal records.
* Avoiding unnecessary collection of sensitive information.
* Transparency about the capabilities and limitations of the application.
* Protection of credentials and other confidential configuration data.

These are design priorities. Their implementation must be verified in the actual application.

## 3. Consent-Based Report Sharing

The SHEALTH Connect prototype demonstrates options for selecting information that a user may wish to share, including symptom history, AI-generated insights, and personal notes.

A complete implementation should explain:

* What information will be shared.
* The identity and role of the intended recipient.
* The purpose of sharing.
* How long the recipient may access the information.
* How consent can be withdrawn for future access, where supported.

A consent checkbox in a user interface is not sufficient by itself. The backend must enforce permissions and record relevant consent decisions securely.

The current Connect prototype does not transmit medical reports to real doctors.

## 4. Identity and Confidentiality

Users should understand when they can browse healthcare options without disclosing their full identity and when a healthcare provider may require identification.

SHEALTH does not promise anonymous consultations. Medical, professional, payment, and legal requirements may necessitate identity verification.

Any future identity-related privacy controls must be implemented transparently and tested before being offered as real services.

## 5. Data Security

The existing prototype uses JSON-file-based persistence.

Before the application can safely handle real patient information, further work would be needed to evaluate and strengthen:

* Authentication and authorisation.
* Access restrictions between users.
* Secure transmission and storage.
* Credential and secret management.
* Input validation and error handling.
* Audit logs for sensitive data access.
* Data-retention and deletion procedures.
* Backup and recovery practices.

The current project should not be described as a fully audited or production-secure medical platform.

## 6. Responsible AI

AI-generated health information can be incomplete, inaccurate, or unsuitable for an individual's circumstances.

SHEALTH aims to support health education without presenting AI output as a medical diagnosis.

Future improvements include retrieving information from a curated medical knowledge base, displaying relevant references, and evaluating generated answers for accuracy and safety.

## 7. Medical Safety

SHEALTH is an educational prototype, not a substitute for professional medical care.

* Symptom patterns cannot independently establish a diagnosis.
* Educational material may not apply to every individual.
* Users should consult qualified healthcare professionals about personal health concerns.
* Urgent or severe symptoms require appropriate medical attention.

## 8. Future Work

Potential improvements include:

* Secure patient and healthcare-professional accounts.
* Verified professional credentials.
* Backend-enforced consent and access permissions.
* Secure medical-report sharing.
* Privacy-focused testing.
* Improved data minimisation and retention controls.
* Source-grounded AI responses.
* Appropriate review of applicable privacy and healthcare requirements.

## 9. Transparency

SHEALTH distinguishes implemented functionality from prototype demonstrations and planned improvements.

Privacy and security claims should reflect the actual implementation and evidence from testing.

**We want technology to help women feel more informed and empowered—not make them choose between seeking healthcare and protecting their privacy.**
