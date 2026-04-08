
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

// Helper to safely parse JSON from Gemini (strips markdown code blocks)
const parseGeminiJson = (text: string) => {
    try {
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleaned);
    } catch (e) {
        console.error("JSON Parse Error on text:", text);
        return [];
    }
};

export const generateReport = async (subject: string, topic: string, hours: string, context: string, templateType: string = 'Standard Study Report'): Promise<string> => {
  const videoContext = context.trim() 
    ? context 
    : "None provided. You MUST automatically select 2-3 relevant, high-quality educational video titles and valid-looking YouTube URLs (e.g., from NPTEL, Coursera, or popular educational channels) that cover this topic perfectly to simulate a real study session. Include these in the Introduction and References.";

  const prompt = `
    You are an AI system called GTU Study Report Generator.

    Your purpose is to generate formal, student-style ${templateType} for GTU first-year subjects based on given topics and video references.
    TEMPLATE TYPE: ${templateType}.

    Follow these system-level rules strictly:

    1. Core Task:
    Prepare a 2–5 page formal ${templateType} written in first-person, as if the student is submitting it to a sir/mam.
    The report MUST use Markdown formatting for structure to allow rich document generation.
    
    ${templateType === 'Detailed Research Paper' ? `
    Structure:
    # ABSTRACT
    # INTRODUCTION
    # LITERATURE REVIEW
    # METHODOLOGY / CORE CONCEPTS
    # DETAILED ANALYSIS
    # FUTURE IMPLICATIONS
    # CONCLUSION
    # REFERENCES
    ` : templateType === 'Executive Summary' ? `
    Structure:
    # OVERVIEW
    # KEY TAKEAWAYS (Use bullet points)
    # CRITICAL ANALYSIS
    # CONCLUSION
    ` : templateType === 'Literature Review' ? `
    Structure:
    # INTRODUCTION
    # HISTORICAL CONTEXT
    # CURRENT TRENDS
    # COMPARATIVE ANALYSIS
    # CONCLUSION
    # REFERENCES
    ` : `
    Structure:
    # INTRODUCTION
    ## PART 1: [Title of Part 1]
    ## PART 2: [Title of Part 2]
    # REFLECTION AND SUMMARY
    # REFERENCES
    `}

    (Include at least one Markdown table in the report summarizing key concepts or comparing items.)

    2. Formatting:
    Use Markdown headings (# for main sections like INTRODUCTION, ## for PARTs, ### for subtopics).
    Use Markdown tables for structured data.
    Use bullet points (- or *) where appropriate.
    Write mathematical expressions using proper LaTeX enclosed in $ for inline math (e.g., $f(x) = x^2 + 2x$) and $$ for block math (e.g., $$ \int x^2 dx $$). Do NOT use plain text for math.

    3. Input Parameters:
    Subject: ${subject}
    Topic: ${topic}
    Total study hours: ${hours}

    4. Tone and Style:
    Formal yet personal (student tone).
    Avoid teacher or third-person explanations.
    Keep the language concise, clear, and sincere.

    Now, generate the report.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-lite',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report. Please check your API key and try again.");
  }
};

export const generateHumanizedReport = async (subject: string, topic: string, hours: string, context: string): Promise<string> => {
  const videoContext = context.trim() 
    ? context 
    : "None provided. Automatically select 2-3 highly relevant educational videos (YouTube/NPTEL) to simulate a real study session.";

  const prompt = `
    ROLE: You are an elite academic ghostwriter for a GTU student. 
    TASK: Write a "Humanized" Study Report. This is a PRO feature request.
    
    CRITICAL CONSTRAINT: 
    - DO NOT USE ASTERISKS (*) ANYWHERE. 
    - DO NOT USE BOLD MARKDOWN (**text**). 
    - DO NOT USE MARKDOWN HEADERS (#). 
    - WRITE IN PURE PLAIN TEXT only.
    - Use CAPS for main sections if needed, but no markdown characters.

    INPUTS:
    - Subject: ${subject}
    - Topic: ${topic}
    - Study Hours: ${hours}
    - Context: ${videoContext}

    CONTENT REQUIREMENTS:
    1.  **Voice**: Extremely natural, first-person student voice ("I studied...", "I learned that..."). It should NOT sound like AI. It should sound like a diligent student.
    2.  **Structure**:
        -   **Introduction**: Mention the topic and the videos watched.
        -   **Body**: Break down the learning into logical sections (e.g., "Concept Overview", "Key Formulas", "Real-world Applications").
        -   **Conclusion**: A personal summary of understanding.
        -   **References**: List the videos.
    3.  **Detail**: Include specific formulas (written naturally, e.g., x^2, not LaTeX), definitions, and examples that show deep understanding.

    Remember: NO MARKDOWN FORMATTING. NO BOLDING. Just clean, professional text ready to be pasted into a Word doc.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro model for humanize feature
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating humanized report:", error);
    throw new Error("Failed to generate humanized report. Please check your API key and try again.");
  }
};

export const humanizeText = async (text: string): Promise<string> => {
  const prompt = `
    ROLE: You are an elite academic ghostwriter.
    TASK: Rewrite the text below to make it undetectable as AI-generated and sound like a genuine student report.

    STRICT RULES:
    1.  **No Markdown**: Remove all bolding (**), italics (*), and markdown headers (#). Use plain text structure.
    2.  **Student Persona**: Use a natural, first-person voice ("I learned...", "The video explained...", "I found it interesting that...").
    3.  **Fluency**: Vary sentence structure. Avoid robotic transitions like "Furthermore", "In conclusion", or "Additionally". Use "Also", "Then", "Finally".
    4.  **Content Accuracy**: Do not change the subject matter, formulas, or links. Keep the core information exactly the same, just change the style.
    
    TEXT TO HUMANIZE:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error humanizing text:", error);
    throw new Error("Failed to humanize text. Please check your API key.");
  }
};

export const generatePptData = async (topic: string, slideCount: number, templateType: string = 'General'): Promise<any[]> => {
  const prompt = `
    ROLE: Professional Presentation Designer.
    TASK: Generate content for a ${templateType} presentation on "${topic}".
    SLIDES: Exactly ${slideCount} slides.
    TEMPLATE TYPE: ${templateType}.

    ${templateType === 'Academic Lecture' ? `
    Structure: Title -> Learning Objectives -> Core Concepts -> Detailed Breakdown -> Summary -> Q&A.
    ` : templateType === 'Business Pitch' ? `
    Structure: Title -> The Problem -> Our Solution -> Market Opportunity -> Business Model -> The Team -> Thank You.
    ` : templateType === 'Technical Deep Dive' ? `
    Structure: Title -> Architecture Overview -> Component Analysis -> Implementation Details -> Performance Metrics -> Conclusion.
    ` : `
    Structure: Title -> Introduction -> Body Points -> Conclusion.
    `}

    REQUIREMENTS:
    - Create a structured narrative based on the template.
    - "image_prompt": A concise, 2-3 word English visual description for a background image (e.g., "futuristic city", "circuit board", "ancient history").
    - "layout": Choose best layout from: "title", "content_left" (image left, text right), "content_right" (image right, text left), "center" (centered text), "thank_you".
    - "content": An array of strings. For title slides, index 0 is subtitle. For others, they are bullet points.
    
    Return strictly a JSON Array. Do not wrap in markdown code blocks.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    layout: { type: Type.STRING, enum: ["title", "content_left", "content_right", "center", "thank_you"] },
                    content: { type: Type.ARRAY, items: { type: Type.STRING } },
                    image_prompt: { type: Type.STRING }
                },
                required: ["title", "layout", "content", "image_prompt"]
            }
        }
      }
    });
    
    return parseGeminiJson(response.text || "[]");
  } catch (error) {
    console.error("Error generating PPT Data:", error);
    throw new Error("Failed to generate presentation content. Please check your API key and try again.");
  }
};

export const getExpertAnswer = async (query: string, templateType: string = 'Standard'): Promise<string> => {
  const prompt = `
    SYSTEM ROLE: You are an Expert GTU Educational Tutor Agent.
    TEMPLATE TYPE: ${templateType}.
    
    STRICT INSTRUCTIONS:
    1.  **BE CONCISE**: Max 250 words. Provide a direct, high-value explanation.
    2.  **STAY ON TOPIC**: No filler words.
    3.  **STRUCTURE**:
        ${templateType === "Explain Like I'm 5" ? `
        -   **Simple Analogy**: Use a very simple real-world comparison.
        -   **The Concept**: Explain it using basic language.
        -   **Why it matters**: 1 sentence.
        ` : templateType === "Technical Breakdown" ? `
        -   **Definition**: Precise technical definition.
        -   **Architecture/Mechanism**: How it works under the hood.
        -   **Key Specifications**: 3-4 technical bullet points.
        ` : templateType === "Exam-style Answer" ? `
        -   **Introduction**: 2-line definition.
        -   **Main Points**: Structured for maximum marks (bullet points).
        -   **Diagram Description**: What to draw in the exam.
        ` : `
        -   **Definition**: 1 sentence clear definition.
        -   **Key Concepts**: 2-3 bullet points.
        -   **Analogy/Trick**: 1 short memory aid.
        `}
    4.  **VISUAL**: You MUST end your response with a specific description for a visual aid.
        -   Format: "VISUAL_PROMPT: <description>"
        -   The description should specify the best type of visual: "A bar graph showing...", "A flowchart of...", "A labeled schematic diagram of...", or "A 3D model illustration of...".
    
    QUERY: "${query}"
  `;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error getting expert answer:", error);
    throw new Error("Failed to get expert answer.");
  }
};

export const generateInfographic = async (description: string): Promise<string> => {
  try {
    const prompt = `
      Create a high-quality educational visual representation for the following description:
      "${description}"
      
      Requirements:
      - Style: Clean, flat design, academic, white background.
      - Type: Can be a Graph, Chart, Flowchart, Schematic Diagram, or 3D Model Illustration depending on the description.
      - Clarity: Use distinct colors and thick lines. Easy to read.
    `;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
    }
    return '';
  } catch (error) {
    console.error("Infographic generation error:", error);
    return '';
  }
};

export const generateQuiz = async (context: string): Promise<any[]> => {
    const prompt = `
      Based on the following educational text, generate 5 multiple-choice questions to test the student's understanding.
      TEXT: ${context.substring(0, 5000)}
      OUTPUT FORMAT: JSON Array
    `;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      return parseGeminiJson(response.text || "[]");
    } catch (error) {
      console.error("Quiz generation error:", error);
      return [];
    }
};

// --- CASE STUDY REPORT FEATURES ---

export const generateCaseStudyReport = async (
    studentName: string,
    enrolmentNumber: string,
    studentClass: string,
    subject: string,
    topics: string[],
    institution: string,
    department: string,
    templateType: string = 'Case Study'
): Promise<any> => {
    const prompt = `
        ROLE: Academic ${templateType} Writer.
        TASK: Generate a comprehensive ${templateType} Activity Report for a student.
        STUDENT: ${studentName}, Enrolment: ${enrolmentNumber}, Class: ${studentClass}.
        SUBJECT: ${subject}.
        TOPICS: ${topics.join(", ")}.
        TEMPLATE TYPE: ${templateType}.

        ${templateType === 'Lab Report' ? `
        For EACH topic (Experiment), generate:
        1. Aim: Objective of the experiment.
        2. Apparatus/Tools: List of software or hardware used.
        3. Theory: Background information.
        4. Procedure: Step-by-step instructions.
        5. Observations/Results: Expected or simulated outcomes.
        6. Conclusion: Summary of learning.
        ` : templateType === 'Technical Review' ? `
        For EACH topic, generate:
        1. Abstract: Brief summary.
        2. Literature Review: Current state of the technology.
        3. Technical Analysis: Deep dive into the mechanics.
        4. Comparison: Pros and cons vs alternatives.
        5. Future Scope: Where the tech is heading.
        6. Conclusion: Final verdict.
        ` : templateType === 'Project Proposal' ? `
        For EACH topic, generate:
        1. Problem Statement: What issue are we solving?
        2. Proposed Solution: How will we solve it?
        3. Methodology: Steps to implement.
        4. Resource Requirements: What is needed?
        5. Expected Impact: Benefits of the project.
        6. Conclusion: Why this project should proceed.
        ` : `
        For EACH topic, generate:
        1. Introduction: Context and importance of the topic.
        2. Scenario: A realistic professional or academic situation related to the topic.
        3. Prompt: A specific, well-crafted prompt that would be given to an AI (like ChatGPT) to address the scenario.
        4. AI Output: A high-quality, realistic AI-generated response to that prompt.
        5. Analysis: A critical evaluation of why the AI output is effective or professional.
        6. Limitations: Potential drawbacks or areas where human oversight is needed.
        7. Conclusion: Summary of learning from this specific case study.
        `}

        Format the output as a JSON object with:
        - institution: "${institution || 'SHREE SWAMI ATMANAND SARASWATI INSTITUTE OF TECHNOLOGY'}"
        - department: "${department || 'COMPUTER ENGINEERING DEPARTMENT'}"
        - subject: "${subject}"
        - reportType: "Activity Report: ${templateType}"
        - studentName: "${studentName}"
        - enrolmentNumber: "${enrolmentNumber}"
        - class: "${studentClass}"
        - caseStudies: An array of objects, one for each topic, containing:
            - topicTitle: The title of the topic
            ${templateType === 'Lab Report' ? `
            - aim: string
            - apparatus: string
            - theory: string
            - procedure: string
            - observations: string
            - conclusion: string
            ` : templateType === 'Technical Review' ? `
            - abstract: string
            - literatureReview: string
            - technicalAnalysis: string
            - comparison: string
            - futureScope: string
            - conclusion: string
            ` : templateType === 'Project Proposal' ? `
            - problemStatement: string
            - proposedSolution: string
            - methodology: string
            - resourceRequirements: string
            - expectedImpact: string
            - conclusion: string
            ` : `
            - introduction: string
            - scenario: string
            - promptGiven: string
            - aiOutput: string
            - analysis: string
            - limitations: string[] (array of points)
            - conclusion: string
            `}

        Return strictly a JSON object.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        institution: { type: Type.STRING },
                        department: { type: Type.STRING },
                        subject: { type: Type.STRING },
                        reportType: { type: Type.STRING },
                        studentName: { type: Type.STRING },
                        enrolmentNumber: { type: Type.STRING },
                        class: { type: Type.STRING },
                        caseStudies: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    topicTitle: { type: Type.STRING },
                                    // Dynamic properties based on templateType
                                    ...(templateType === 'Lab Report' ? {
                                        aim: { type: Type.STRING },
                                        apparatus: { type: Type.STRING },
                                        theory: { type: Type.STRING },
                                        procedure: { type: Type.STRING },
                                        observations: { type: Type.STRING },
                                        conclusion: { type: Type.STRING }
                                    } : templateType === 'Technical Review' ? {
                                        abstract: { type: Type.STRING },
                                        literatureReview: { type: Type.STRING },
                                        technicalAnalysis: { type: Type.STRING },
                                        comparison: { type: Type.STRING },
                                        futureScope: { type: Type.STRING },
                                        conclusion: { type: Type.STRING }
                                    } : templateType === 'Project Proposal' ? {
                                        problemStatement: { type: Type.STRING },
                                        proposedSolution: { type: Type.STRING },
                                        methodology: { type: Type.STRING },
                                        resourceRequirements: { type: Type.STRING },
                                        expectedImpact: { type: Type.STRING },
                                        conclusion: { type: Type.STRING }
                                    } : {
                                        introduction: { type: Type.STRING },
                                        scenario: { type: Type.STRING },
                                        promptGiven: { type: Type.STRING },
                                        aiOutput: { type: Type.STRING },
                                        analysis: { type: Type.STRING },
                                        limitations: { type: Type.ARRAY, items: { type: Type.STRING } },
                                        conclusion: { type: Type.STRING }
                                    })
                                },
                                required: ["topicTitle", "conclusion"]
                            }
                        }
                    },
                    required: ["institution", "department", "subject", "reportType", "studentName", "enrolmentNumber", "class", "caseStudies"]
                }
            }
        });
        return parseGeminiJson(response.text || "{}");
    } catch (error) {
        console.error("Case Study generation error:", error);
        throw new Error("Failed to generate case study report. Please try again.");
    }
};
