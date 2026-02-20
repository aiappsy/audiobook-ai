
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { BookData, ProVersion, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Encodes Uint8Array to Base64 string manually as per requirements.
 */
function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Decodes Base64 string to Uint8Array manually as per requirements.
 */
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decodes raw PCM audio data.
 */
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const generateProVersion = async (book: BookData): Promise<{ pro: ProVersion, sources: GroundingSource[] }> => {
  const prompt = `Create a professional 'Pro Version' analysis of the book "${book.title}" by ${book.author}. 
    Focus on executive-level insights, conceptual architecture, and actionable intelligence.
    Use thinking to ensure deep historical and contemporary accuracy.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          keyConcepts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                importance: { type: Type.NUMBER }
              },
              required: ["title", "description", "importance"]
            }
          },
          actionableInsights: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          historicalContext: { type: Type.STRING },
          chapterBreakdown: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                chapter: { type: Type.STRING },
                keyTakeaway: { type: Type.STRING }
              },
              required: ["chapter", "keyTakeaway"]
            }
          },
          visualMetaphorPrompt: { type: Type.STRING },
          contemporaryRelevance: { type: Type.STRING }
        },
        required: [
          "executiveSummary", "keyConcepts", "actionableInsights", 
          "historicalContext", "chapterBreakdown", "visualMetaphorPrompt", 
          "contemporaryRelevance"
        ]
      }
    }
  });

  const pro = JSON.parse(response.text.trim()) as ProVersion;
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  const sources: GroundingSource[] = groundingChunks
    .filter((c: any) => c.web)
    .map((c: any) => ({
      title: c.web.title || "Reference",
      uri: c.web.uri
    }));

  return { pro, sources };
};

export const generateBookImage = async (prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-end, professional concept art illustration of: ${prompt}. Cinematic lighting, 8k, elegant design.` }]
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
};

export const generateAudioBrief = async (text: string): Promise<AudioBuffer> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Narrate this book brief professionally and calmly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("No audio data received");

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(
    decode(base64Audio),
    audioContext,
    24000,
    1,
  );

  return audioBuffer;
};
