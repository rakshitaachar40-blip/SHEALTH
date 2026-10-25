# SHEALTH — Medical Sources and AI Information Policy

## 1. Our Principle: Evidence Before AI

Women's health information can influence important personal decisions. SHEALTH aims to make educational health information accessible while recognising the importance of credible sources, medical accuracy, and responsible communication.

Our guiding principle is:

**AI should help explain health information, not invent medical facts or replace qualified healthcare professionals.**

## 2. Reference Sources

SHEALTH identifies the following organisations and resources as potential references for its women's health knowledge base.

### World Health Organization (WHO)

Website: https://www.who.int/

WHO publishes global public-health information and guidance, including resources relevant to sexual and reproductive health.

### National Health Service (NHS)

Website: https://www.nhs.uk/conditions/

The NHS provides patient-facing information about health conditions, symptoms, investigations, and treatments.

### Indian Council of Medical Research (ICMR)

Website: https://www.icmr.gov.in/

ICMR supports biomedical research in India and provides access to relevant research and health-related resources.

### MedlinePlus

Website: https://medlineplus.gov/

MedlinePlus provides accessible health information for patients and families.

**Important:** These are reference resources identified for the project. Their inclusion in this document does not mean that every source has already been incorporated into the application or that the application fetches information from these websites in real time.

## 3. Intended Medical-Content Workflow

SHEALTH aims to use a structured approach to developing trustworthy health education.

1. Identify a relevant women's health topic.
2. Locate appropriate information from credible medical or public-health sources.
3. Review the original material for accuracy, relevance, and context.
4. Organise selected information into topic-based educational resources.
5. Where source-grounded AI is implemented, retrieve relevant passages before generating an explanation.
6. Provide source references where available.
7. Review content periodically and update it when appropriate.

Topics may include menstrual health, PCOS, endometriosis, menopause, anaemia, and sexual and reproductive health.

Content must be reviewed before being presented as medically validated guidance.

## 4. AI-Assisted Information

The existing project includes an optional Anthropic API integration for AI-generated summaries.

A potential future improvement is Retrieval-Augmented Generation (RAG). In this approach, a system retrieves relevant information from an approved knowledge base and provides it to an AI model as supporting context.

A properly implemented system can help connect generated explanations to selected references. However, retrieval does not guarantee correctness: information may be incomplete, outdated, or misunderstood.

The extent to which the current application retrieves medical source material, grounds AI responses, or displays citations must be verified against the submitted implementation.

## 5. Medical Safety

SHEALTH is an educational prototype, not a diagnostic system.

* AI-generated information may be incomplete or inaccurate.
* Symptom patterns do not establish a medical diagnosis.
* General educational information may not apply to every individual.
* Users should consult qualified healthcare professionals about personal health concerns.
* Urgent or severe symptoms require appropriate medical attention.

## 6. Source Transparency

For each medical resource incorporated into the application, the project should record:

* Article or publication title.
* Original source URL.
* Relevant health topic.
* Date accessed or reviewed.
* Any applicable publication or update date.
* Review status.

This makes it easier to trace educational content to its original source and maintain it responsibly.

## 7. Current Status and Future Work

The project includes a health-education section and an optional AI integration. A comprehensive, medically reviewed knowledge base with verified source citations and retrieval-based AI grounding remains a development objective unless demonstrated in the submitted code.

Future work may include curated medical articles, source-linked answers, content-review workflows, and testing to evaluate factual accuracy.

## 8. Disclaimer

SHEALTH provides educational and informational support. It does not replace professional medical advice, diagnosis, or treatment.

**Our commitment is to promote accessible health education while being transparent about the evidence, limitations, and capabilities of the technology.**
