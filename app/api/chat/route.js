import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import mongoose from "mongoose";
import Chat from "@/models/chat";
import { connectToDatabase } from "@/lib/db";

export const maxDuration = 30;

export async function POST(req) {
  try {
    const { message } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: "Message is required" }), {
        status: 400,
      });
    }

    // ✅ Connect to MongoDB
    await connectToDatabase();

    // ✅ Use generateText and await the result
    const result = await generateText({
      model: google("gemini-2.0-flash"),
      prompt: message,
    });

    // ✅ This is your bot’s reply text
    const reply = result.text;

    // ✅ Save both user + assistant messages
    await Chat.create({ role: "user", message });
    await Chat.create({ role: "assistant", message: reply });

    // ✅ Send reply back to frontend
    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const chats = await Chat.find().sort({ createdAt: 1 });
    return new Response(JSON.stringify(chats), { status: 200 });
  } catch (error) {
    console.error("GET error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
}