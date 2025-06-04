from google import genai
from google.genai import types
from dotenv import dotenv_values

config = dotenv_values(".env")

# get API Key from .env file
client = genai.Client(api_key=config['API_KEY'])


def genarate(paragraph):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=paragraph,
        config=types.GenerateContentConfig(
            system_instruction="You are a Robot. Your name is Jimmy.",
            max_output_tokens=400,
            temperature=0.3
        )
    )

    retrieve_blog = response.text
    return retrieve_blog


keep_writing = True

while keep_writing:
    # asking user do you want to continute the descusion
    print('Jimmy the Robot at your service. How can I assist you today?')
    answer = input('if you want to chat with me simply type Start (If you want to end the chat simply type End) ')
    while answer != 'End':
        paragraph = input('What do you want to talk about? ')
        print(genarate(paragraph))
        if paragraph == 'End':
            print('Goodbye')
            break

    keep_writing = False


