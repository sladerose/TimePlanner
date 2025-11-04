import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI: GoogleGenerativeAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
export async function GET() {
  try {
    const models = await genAI.listModels();
    const modelNames = models.map(model => model.name);
    return NextResponse.json({ models: modelNames }, { status: 200 });
  } catch (error: any) {
    console.error('Error listing Gemini models:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0]; // YYYY-MM-DD

    const prompt = `Extract the following information from the user's message and return it as a JSON array of objects. Each object in the array should represent a daily entry. If a value (target_hours, actual_hours) is not explicitly mentioned for a day, set it to null. If the user expresses an intent to clear or set to zero for target or actual hours, set the respective field to 0. The date should be in 'YYYY-MM-DD' format. If no date is specified for a single entry, default to today's date. Today's date is ${todayFormatted}. If the message implies a deletion of an entry or hours for a day, set 'operation' to 'delete'; otherwise, set it to 'upsert'.

User message: "${message}"

JSON format: [
  {"entry_date": "YYYY-MM-DD", "target_hours": number | null, "actual_hours": number | null, "operation": "upsert" | "delete"}
]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const jsonString = text.replace(/```json\n|```/g, '').trim();

        let parsedGeminiResponse: any[];

        try {

          parsedGeminiResponse = JSON.parse(jsonString);

          if (!Array.isArray(parsedGeminiResponse)) {

            throw new Error('Gemini did not return a JSON array.');

          }

        } catch (jsonError) {

          console.error('Failed to parse Gemini JSON response:', text, jsonError);

          return NextResponse.json({ error: 'Failed to process your request. Gemini did not return valid JSON or a JSON array.' }, { status: 500 });

        }

    

        const results = [];

        for (const entry of parsedGeminiResponse) {

          const { entry_date, target_hours, actual_hours, operation } = entry;

    

          if (!entry_date) {

            console.warn('Gemini did not provide an entry_date for an item:', entry);

            continue; // Skip this entry if date is missing

          }

    

          const entryToProcess = {

            entry_date,

            target_hours: target_hours !== null ? target_hours : null, // Keep null if not specified

            actual_hours: actual_hours !== null ? actual_hours : null, // Keep null if not specified

            user_id: '2794e1e5-f071-484c-a886-bf397c23d540', // Consistent placeholder UUID

          };

    

          let resultData;

          let resultError;

    

          if (operation === 'delete') {

            const { data, error } = await supabase

              .from('daily_entries')

              .delete()

              .eq('user_id', entryToProcess.user_id)

              .eq('entry_date', entryToProcess.entry_date)

              .select();

            resultData = data;

            resultError = error;

          } else { // Default to upsert

            // Always check for an existing entry first

            const { data: existingEntries, error: fetchError } = await supabase

              .from('daily_entries')

              .select('*')

              .eq('user_id', entryToProcess.user_id)

              .eq('entry_date', entryToProcess.entry_date);

    

            if (fetchError) {

              console.error('Supabase fetch error:', fetchError);

              // Continue to next entry, but log error

              results.push({ entry, error: fetchError.message });

              continue;

            }

    

            if (existingEntries && existingEntries.length > 0) {

              // Entry exists, perform an update

              const existingEntry = existingEntries[0];

              const updatedEntry = {

                ...existingEntry,

                ...(entryToProcess.target_hours !== null ? { target_hours: entryToProcess.target_hours } : {}),

                ...(entryToProcess.actual_hours !== null ? { actual_hours: entryToProcess.actual_hours } : {}),

              };

    

              const { data, error } = await supabase

                .from('daily_entries')

                .update(updatedEntry)

                .eq('id', existingEntry.id)

                .select();

              resultData = data;

              resultError = error;

            } else {

              // No entry exists, perform an insert

              const { data, error } = await supabase

                .from('daily_entries')

                .insert([entryToProcess])

                .select();

              resultData = data;

              resultError = error;

            }

          }

    

          if (resultError) {

            console.error('Supabase operation error for entry:', entry, resultError);

            results.push({ entry, error: resultError.message });

          } else {

            results.push({ entry, success: true, data: resultData });

          }

        }

    

        // Return a summary of all operations

        return NextResponse.json({ success: true, results }, { status: 200 });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
