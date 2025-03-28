import {
  NextResponse
} from 'next/server';
import fs from 'fs'; // Import Node.js file system module
import path from 'path'; // Import Node.js path module
import {
  GoogleGenAI,
  Type
} from "@google/genai";

// --- Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set in environment variables.");
  // Consider throwing an error during build/startup in a real scenario
  // process.exit(1);
}

// Define the path to your document
// process.cwd() gives the root directory of your Next.js project
const docPath = path.join(process.cwd(), 'public', 'documents.txt');
let documentContent = ''; // Variable to hold document content

// --- Read Document Content ---
try {
  // Read the file synchronously during initialization.
  // Choose async reading inside POST if the file changes frequently or is very large.
  documentContent = fs.readFileSync(docPath, 'utf-8');
  console.log(`Successfully loaded document: ${docPath}`);
} catch (error) {
  console.error(`Error reading document file at ${docPath}:`, error);
  // Decide how to handle this:
  // 1. Allow startup but log error (current approach)
  // 2. Throw error to prevent startup if document is critical: throw new Error(...)
  documentContent = ''; // Ensure it's an empty string if reading fails
}

// --- Initialize Gemini ---
const ai = new GoogleGenAI({
  apiKey: apiKey
});

// --- API Route Handler ---
export async function POST(req) {
  // Runtime check for API key
  if (!apiKey) {
      console.error("API call attempted without GEMINI_API_KEY.");
      return NextResponse.json({
          error: 'API key not configured on server'
      }, {
          status: 500
      });
  }

  let userQuestion;
  try {
      const body = await req.json();
      userQuestion = body.question;
  } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({
          error: 'Invalid request body'
      }, {
          status: 400
      });
  }

  if (!userQuestion) {
      return NextResponse.json({
          error: 'No question provided'
      }, {
          status: 400
      });
  }

  try {
      // --- Construct the Prompt with Context ---
      // Combine the static document content with the user's question
      const fullPrompt = `
Context from Khon Kaen University document:
---
${documentContent}
---

Question: ${userQuestion}

Answer:`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-pro-exp-03-25',
          systemInstruction: `You are a Teacher in Khon Kaen University you can help me to answer any question about Khon Kaen Universit  . Answer in Thai with markdown text`,
          contents: fullPrompt,
          config: {
              responseMimeType: 'application/json',
              responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                      'answer': {
                          type: Type.STRING,
                          description: 'Answer of the question.',
                          nullable: false,
                      },
                      'image': {
                          type: Type.STRING,
                          description: 'Available image name.',
                          enum: ["ช่องทางติดต่อ.jpg", "ค่าธรรมเนียมการศึกษา.png", "Not use any image."],
                          nullable: false
                      }
                  },
                  required: ['answer', 'image'],
              },
          },
      });
      console.debug(response.text);
      const responseText = JSON.parse(response.text)

      // Return the answer
      return NextResponse.json({
          answer: responseText.answer,
          image: responseText.image
      });

  } catch (error) {
      console.error('Gemini API error:', error);
      let errorMessage = 'เกิดข้อผิดพลาดในการสร้างคำตอบจากโมเดล AI (Error generating response from AI model)';
      if (error.message) {
          // Check for specific, non-sensitive errors
          if (error.message.includes('API key not valid')) {
              errorMessage = 'API Key ที่กำหนดค่าไว้สำหรับ Gemini ไม่ถูกต้อง (Invalid API Key configured for Gemini.)';
          } else if (error.message.includes('quota')) {
              errorMessage = 'เกินโควต้าการใช้งาน Gemini API แล้ว (Exceeded Gemini API quota.)';
          } else {
              // Avoid leaking potentially sensitive details for generic errors
              // errorMessage += `: ${error.message}`; // Optionally add more detail in dev
          }
      }

      return NextResponse.json({
          error: errorMessage
      }, {
          status: 500
      });
  }
}

// Optional: GET handler
export async function GET(req) {
  return NextResponse.json({
      error: 'Method Not Allowed. Use POST.'
  }, {
      status: 405
  });
}