import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are the AI Assistant for "Merlano Tecnología Vehicular", a premier automotive technology shop located in Berisso, Argentina (Calle 7 #4143 e 163 y 164).
You are helpful, knowledgeable, and polite. 

The shop specializes in providing comprehensive solutions for all types of vehicles:
- **Multimedia:** Sales and installation of original and alternative multimedia centers (Android/CarPlay).
- **Locksmithing (Cerrajería):** Integral automotive locksmithing, including coded keys of all types.
- **Electronics:** General automotive electronics, diagnosis, and repairs. ECU/Injection diagnosis.
- **Electricity:** General electricity, repair of alternators and starters (burros de arranque).
- **Safety:** Integral Airbag and ABS service. Sales and installation of alarms (Positron G8, etc.).
- **Comfort:** Sales and installation of central locking (cierres centralizados), power windows (alza cristales - sales, installation, repair).
- **Batteries:** Sales and installation of multi-brand batteries.
- **Climate Control:** Integral repair of air conditioning and heating systems. **Specialized in:** Private vehicles, heavy machinery, buses, and agricultural equipment.
- **Tinting (Polarizados):** Integral service for vehicles and commercial/residential.

Your goal is to answer customer questions, recommend products based on their car model, and help them understand the benefits of the services.
If asked about opening hours, say Monday to Friday 09:00 - 18:00.
For complex technical questions about car compatibility or wiring, think deeply before answering.
Always reply in Spanish as the primary audience is in Argentina.
`;

export const streamChat = async (
  history: ChatMessage[],
  currentMessage: string,
  onChunk: (text: string) => void,
  onComplete: (fullText: string, groundingUrls?: string[]) => void
) => {
  // Check if API key is available
  if (!process.env.API_KEY) {
    const defaultMessage =
      "En este momento el asistente no se encuentra disponible, enviar mensaje a 2213334444";
    onChunk(defaultMessage);
    onComplete(defaultMessage);
    return;
  }

  try {
    // Construct the history for the API
    // We only send the last few turns to keep context but avoid overload if necessary,
    // though Gemini has a large context window.
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    }));

    const chat = ai.chats.create({
      model: "gemini-3-pro-preview", // Using Pro for intelligence
      history: chatHistory,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: {
          thinkingBudget: 32768, // High budget for complex automotive troubleshooting
        },
        tools: [{ googleSearch: {} }], // Grounding for latest car specs/prices/news
      },
    });

    const resultStream = await chat.sendMessageStream({
      message: currentMessage,
    });

    let fullText = "";
    let groundingUrls: string[] = [];

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }

      // Extract grounding metadata if available
      const chunks = c.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((gc: any) => {
          if (gc.web?.uri) {
            groundingUrls.push(gc.web.uri);
          }
        });
      }
    }

    onComplete(
      fullText,
      groundingUrls.length > 0 ? Array.from(new Set(groundingUrls)) : undefined
    );
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    onChunk(
      "Lo siento, tuve un problema al procesar tu consulta. Por favor intenta de nuevo."
    );
    onComplete(
      "Lo siento, tuve un problema al procesar tu consulta. Por favor intenta de nuevo."
    );
  }
};
