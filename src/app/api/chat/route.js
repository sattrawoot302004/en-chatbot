// src/app/api/chat/route.js

import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from "@google/genai";

// --- Configuration ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("FATAL ERROR: GEMINI_API_KEY is not set in environment variables.");
}

// Define the path to your document
const docPath = path.join(process.cwd(), 'public', 'documents.txt');
let documentContent = '';

// --- Read Document Content ---
try {
  documentContent = fs.readFileSync(docPath, 'utf-8');
  console.log(`Successfully loaded document: ${docPath}`);
} catch (error) {
  console.error(`Error reading document file at ${docPath}:`, error);
  documentContent = '';
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
    const fullPrompt = `
โปรดตอบเป็นภาษาไทย และจัดรูปแบบคำตอบด้วย Markdown แต่ถ้าไม่เกี่ยวกับ document ให้ตอบตามธรรมชาติเลยแต่ขอเป็นภาษาไทย
Context from Khon Kaen University document:
---
${documentContent}
---

Question: ${userQuestion}

Answer:`;

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create a separate call to determine the image first
          // (Since we can't use structured response with streaming)
          const imageDecisionResponse = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            systemInstruction: `You are an assistant for Khon Kaen University's Engineering Faculty. Analyze the user's question and select the most appropriate image from the available options. Choose "ช่องทางติดต่อ.jpg" for questions about contact information, communication channels, or reaching the faculty. Choose "ค่าธรรมเนียมการศึกษา.png" for questions about tuition fees, educational costs, or financial matters. Choose "Not use any image." for all other topics that don't fit these categories.`,
            contents: `Question: ${userQuestion}`,
            config: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  'image': {
                    type: Type.STRING,
                    description: 'Available image name.',
                    enum: ["ช่องทางติดต่อ.jpg", "ค่าธรรมเนียมการศึกษา.png", "Not use any image."],
                    nullable: false
                  }
                },
                required: ['image'],
              },
            },
          });
          
          const imageData = JSON.parse(imageDecisionResponse.text);
          console.log(imageData)
          
          // Send initial metadata including the image decision
          controller.enqueue(JSON.stringify({
            type: 'metadata',
            image: imageData.image || "Not use any image."
          }));
          
          // Now start the streaming content generation
          const response = await ai.models.generateContentStream({
            model: 'gemini-2.0-flash',
            systemInstruction: `You are an expert assistant specializing in providing information about the Faculty of Engineering at Khon Kaen University. Your responses must always be in Thai language. Format your answers using proper Markdown for readability, including appropriate headings, bullet points, and emphasis where needed.
When answering questions:
1. If the question relates to the provided document content, prioritize this information and cite it in your answer
2. For questions not covered in the document, provide accurate information based on your knowledge
3. If uncertain about any information, acknowledge this limitation clearly
4. Keep responses concise but comprehensive, with a friendly and helpful tone
5. Use appropriate Thai formal language suitable for an educational institution
6. If asked about something unrelated to Khon Kaen University, politely redirect to university-related topics

ALL RESPONSES MUST BE WRITTEN IN THAI LANGUAGE WITH MARKDO`,
            contents: fullPrompt,
          });
          
          // Process each chunk from the stream
          for await (const chunk of response) {
            console.log(chunk.text)
            if (chunk.text) {
              controller.enqueue(JSON.stringify({
                type: 'chunk',
                content: chunk.text
              }));
            }
          }
          
          // Signal completion
          controller.enqueue(JSON.stringify({ type: 'done' }));
          controller.close();
          
        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(JSON.stringify({
            type: 'error',
            error: 'เกิดข้อผิดพลาดในการสร้างคำตอบจากโมเดล AI'
          }));
          controller.close();
        }
      }
    });

    // Return the streaming response
    return new Response(stream, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Gemini API error:', error);
    let errorMessage = 'เกิดข้อผิดพลาดในการสร้างคำตอบจากโมเดล AI';
    
    return NextResponse.json({
      error: errorMessage
    }, {
      status: 500
    });
  }
}

export async function GET(req) {
  return NextResponse.json({
    error: 'Method Not Allowed. Use POST.'
  }, {
    status: 405
  });
}