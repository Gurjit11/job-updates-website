import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import openai
from telegram import Bot, Update
from waitress import serve

# from telegram.ext import Dispatcher, MessageHandler, Filters
import asyncio

# Load environment variables from .env
load_dotenv()

# Set up API keys
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

bot = Bot(token=TELEGRAM_BOT_TOKEN)

app = Flask(__name__)
# Allow CORS from specific origin
CORS(app, resources={r"/*": {"origins": "https://job-updates-website.vercel.app"}})


# Coroutine to get updates from Telegram
async def get_updates():
    updates = await bot.get_updates()
    return updates


import requests
import json


def process_with_gemini(api_key, data):
    url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent"
    headers = {"Content-Type": "application/json"}

    prompt_text = f"""
    Convert the following job listings into a standardized JSON format.
    The output should include the company name, role, years of experience or batch eligibility, and the application link for each listing.
    Ensure all fields are properly formatted and consistent.
    Example output format:
    [ {{ "company_name": "Example Company",
     "role": "Example Role",
     "years_of_experience": "X-Y years",
     "batch_eligible": ["Year1", "Year2"],
     "apply_link": "https://example.com/apply"
     "salary": "X-Y LPA"
    }} ]

    api data: {data}
    """

    payload = {
        "contents": [
            {
                "parts": [
                    {
                        "text": prompt_text,
                    }
                ]
            }
        ]
    }

    response = requests.post(
        url + "?key=" + api_key, headers=headers, data=json.dumps(payload)
    )

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.status_code, "message": response.text}


@app.route("/fetch_updates", methods=["POST"])
def fetch_updates():
    # Use asyncio to run the coroutine
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    updates = loop.run_until_complete(get_updates())

    # Process updates
    messages = [update.message.text for update in updates if update.message]
    print("Messages:", messages)
    # Process updates using OpenAI's GPT-3
    responses = []

    # Process the data
    api_key = GEMINI_API_KEY  # Replace with your actual Gemini API key
    formatted_output = process_with_gemini(api_key, messages)
    # for message in messages:
    #     response = openai.Completion.create(
    #         engine="text-davinci-003",
    #         prompt=message,
    #         max_tokens=50
    #     )
    #     responses.append(response.choices[0].text.strip())

    # Return the processed messages
    return jsonify({"messages": formatted_output})


if __name__ == "__main__":
    # app.run(debug=True)
    serve(app, host="0.0.0.0", port=5000, threads=2)
