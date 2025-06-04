from google import genai
from google.genai import types
from dotenv import dotenv_values

config = dotenv_values(".env")

# get API Key from .env file
client = genai.Client(api_key=config['API_KEY'])


def genarate_blog(paragraph_topic):
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=paragraph_topic,
        config=types.GenerateContentConfig(
            max_output_tokens=400,
            temperature=0.3
        )
    )

    retrieve_blog = response.text
    return retrieve_blog


keep_writing = True

while keep_writing:
    # asking user do you want to continute the descusion
    answer = input('Do you want to help with gemini ? (Yes Enter Y, No Enter N) ')
    if (answer == 'Y'):
        paragraph_topic = input('What do you want to talk about? ')
        print(genarate_blog(paragraph_topic))
    elif (answer == 'N'):
        print("Bye!")
        keep_writing = False


