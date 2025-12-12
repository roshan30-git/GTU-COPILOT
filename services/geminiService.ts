
import { GoogleGenAI, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY || "YOUR_API_KEY_HERE" });

export const generateReport = async (subject: string, topic: string, hours: string, context: string): Promise<string> => {
  const videoContext = context.trim() 
    ? context 
    : "None provided. You MUST automatically select 2-3 relevant, high-quality educational video titles and valid-looking YouTube URLs (e.g., from NPTEL, Coursera, or popular educational channels) that cover this topic perfectly to simulate a real study session. Include these in the Introduction and References.";

  const prompt = `
    You are an AI system called GTU Study Report Generator.

    Your purpose is to generate formal, student-style study reports for GTU first-year subjects based on given topics and video references.

    Follow these system-level rules strictly:

    1. Core Task:
    Prepare a 2–5 page formal learning report written in first-person, as if the student is submitting it to a sir/mam.
    The report must sound human, natural, and genuine — like a real student reporting what they personally studied.
    The report must start with an introduction stating the total study time and videos used (with URLs).
    Then include structured parts (e.g., Part 1, Part 2, etc.) describing what the student learned in each study session, including key concepts, formulas, examples, or applications discussed.
    End with a short reflection/summary of what was learned and how it helped understanding the topic.
    Include a “References” section listing all video titles and links.

    2. Formatting:
    Use clean paragraph structure, headings, and bullet points where needed.
    Write in plain text or Markdown ready for .docx export.
    Write mathematical expressions in normal readable form, not LaTeX or code blocks.
    Example: write f(x) = x² + 2x, not \\(f(x)=x^2+2x\\) or $$f(x)=x^2+2x$$.
    Use superscripts, subscripts, and symbols naturally (e.g., x², y₁, sinθ).

    3. Input Parameters:
    Subject: ${subject}
    Topic: ${topic}
    Total study hours: ${hours}
    Video References: ${videoContext}

    4. Tone and Style:
    Formal yet personal (student tone).
    Avoid teacher or third-person explanations.
    No code blocks, no LaTeX, no markdown symbols like $, \\, or **.
    Keep the language concise, clear, and sincere.

    5. Output Goal:
    The report should feel fully human-written and submission-ready for academic purposes.
    Deliver output suitable for direct export or print submission.

    Your identity: an AI system specialized in producing clean, human-style study reports for GTU students — with readable formulas, formal tone, and clear structure.

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

export const generatePptData = async (topic: string, slideCount: number): Promise<any[]> => {
  const prompt = `
    ROLE: Professional Presentation Designer.
    TASK: Generate content for a presentation on "${topic}".
    SLIDES: Exactly ${slideCount} slides.

    REQUIREMENTS:
    - Create a structured narrative: Title -> Introduction -> Body Points -> Conclusion.
    - "image_prompt": A concise, 2-3 word English visual description for a background image (e.g., "futuristic city", "circuit board", "ancient history").
    - "layout": Choose best layout from: "title", "content_left" (image left, text right), "content_right" (image right, text left), "center" (centered text), "thank_you".
    - "content": An array of strings. For title slides, index 0 is subtitle. For others, they are bullet points.
    
    Return strictly a JSON Array.
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
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("Error generating PPT Data:", error);
    throw new Error("Failed to generate presentation content. Please check your API key and try again.");
  }
};

export const getExpertAnswer = async (query: string): Promise<string> => {
  const prompt = `
    SYSTEM ROLE: You are an Expert GTU Educational Tutor Agent, designed to explain any engineering or physics topic in a way that even a complete beginner can understand.
    YOUR RESPONSIBILITIES:
    1. Interpret the user’s topic or question: "${query}"
    2. Explain the concept from scratch, assuming the student has no prior knowledge.
    3. Adjust answer length dynamically:
       - If the topic is simple → give a short, concise explanation.
       - If the topic is complex → give a clear, structured long explanation.
    4. Add memory techniques: Provide a simple trick, mnemonic, analogy, or shortcut to help the student remember the concept.
    5. Use clear structure with headings, steps, and examples.
    6. End with an infographic-style diagram description: Provide a text-based infographic/diagram prompt that visually explains the concept in a clean, minimal way.

    STRICT OUTPUT FORMAT (MARKDOWN):
    Use **Bold** for key terms and ## for Headers.

    ## CONCEPT EXPLANATION
    (Beginner-friendly explanation here...)

    ## WHY IT MATTERS
    (Context on importance...)

    ## REAL-LIFE ANALOGY
    (Simple comparison...)

    ## MEMORY TRICK / HOW TO REMEMBER
    (Mnemonic, trick, or shortcut...)

    ## SHORT SUMMARY
    (One or two sentences...)

    INFOGRAPHIC DIAGRAM PROMPT
    (Copy-friendly prompt text...)
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
      Generate a high-quality, clear, flat-design educational infographic or diagram based on this:
      "${description}"
      Style: Minimalist, clean, academic, white or light background, easy to read lines.
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
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("Quiz generation error:", error);
      return [];
    }
};

// --- NEW PHYSICS MODEL FEATURES ---

export const generatePhysicsProjectIdeas = async (budget: string, interest: string): Promise<any[]> => {
    const prompt = `
        Generate 5 creative and feasible Physics Model Project ideas for engineering students.
        Constraints:
        - Budget: Under ₹${budget} (INR)
        - Domain/Interest: ${interest}
        
        Return a JSON array where each object has:
        - title: Project Title
        - difficulty: "Easy", "Medium", or "Hard"
        - principle: The core physics principle involved
        - build_summary: A 1-sentence summary of how to build it.
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
                            difficulty: { type: Type.STRING },
                            principle: { type: Type.STRING },
                            build_summary: { type: Type.STRING }
                        },
                        required: ["title", "difficulty", "principle", "build_summary"]
                    }
                }
            }
        });
        return JSON.parse(response.text || "[]");
    } catch (error) {
        console.error("Idea generation error:", error);
        return [];
    }
};

export const generatePhysicsReportJSON = async (modelName: string, dept: string, studentClass: string): Promise<any> => {
    const prompt = `
        ROLE: GTU Physics Laboratory Instructor.
        TASK: Generate a structured Physics Model Report for the project "${modelName}".
        CONTEXT: Department: ${dept}, Class: ${studentClass}.
        PERSPECTIVE: Write in FIRST-PERSON PLURAL ("We developed...", "Our model...").
        
        REQUIREMENTS:
        - Content must be DETAILED and ACADEMIC. No short or empty sections.
        - "Aim": 2-3 detailed sentences describing the objective.
        - "Apparatus": List at least 5-8 specific materials/components.
        - "Principle": A detailed scientific explanation of the physics principle (approx 100-150 words).
        - "Construction": 5-10 step-by-step instructions on how it was built.
        - "Working": 5-10 step-by-step points describing the mechanism and operation.
        - "Applications": List at least 3-5 real-world applications.
        - "Conclusion": A solid summarizing paragraph.
        - "aim_diagram_prompt": A visual description to generate a schematic diagram for the Aim.
        - "conclusion_chart_prompt": A visual description to generate a results chart or infographic for the Conclusion.
        
        Return a JSON object with strictly these fields.
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
                        title: { type: Type.STRING },
                        aim: { type: Type.STRING },
                        apparatus: { type: Type.ARRAY, items: { type: Type.STRING } },
                        principle: { type: Type.STRING },
                        construction: { type: Type.ARRAY, items: { type: Type.STRING } },
                        working: { type: Type.ARRAY, items: { type: Type.STRING } },
                        applications: { type: Type.ARRAY, items: { type: Type.STRING } },
                        conclusion: { type: Type.STRING },
                        aim_diagram_prompt: { type: Type.STRING },
                        conclusion_chart_prompt: { type: Type.STRING }
                    },
                    required: ["title", "aim", "apparatus", "principle", "construction", "working", "applications", "conclusion", "aim_diagram_prompt", "conclusion_chart_prompt"]
                }
            }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        console.error("Physics Report JSON error", error);
        throw new Error("Failed to generate report structure. Please try again.");
    }
};

export const generatePhysicsImage = async (promptText: string): Promise<string> => {
    if (!promptText) return '';
    try {
        const prompt = `Technical schematic diagram or educational infographic: ${promptText}. White background, clean lines, academic style.`;
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
    } catch (e) {
        console.error("Physics Image Gen Error", e);
        return '';
    }
};
