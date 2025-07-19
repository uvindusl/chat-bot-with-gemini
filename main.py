from google import genai
from google.genai import types
from dotenv import dotenv_values
from flask import Flask , jsonify , request
import logging

config = dotenv_values(".env")
app = Flask(__name__)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
key = config['API_KEY']

try:
    client =genai.Client(api_key=key)
except Exception as e:
    logger.error(f"Error connecting to Gemini", {e})
    client = None

def generateOutput(paragraph):
    if not client:
        return "Error there is No API KEY initialized."

    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            content=paragraph,
            config=types.GenerateContentConfig(
                system_instruction="You are a Robot. Your name is Jimmy.",
                max_output_tokens=400,
                temperature=0.3
            )
        )
        if hasattr(response, 'text'):
            return response.text
        else:
            print(f"Unexpected response: {response}")
            return "Error: couldn't get expected response"

    except Exception as e:
        logger.error(f"Error generating output: {e}")
        return f"Failed to generate output ({e})"

@app.route('/display' , methods=['POST'])
def display():
    if not request.is_json:
        return jsonify({"status":"error", "message":"Request is not JSON"}), 400

    file = request.json
    logger.info('Request received')

    data = file.get('message')

    # keep_writing = True
    #
    # while keep_writing:
    #     while data != 'End':
    #         answer = generateOutput(data)
    #         logger.info(f"Sending data: {data}")
    #         return jsonify({
    #             "status": "success",
    #             "message" : answer
    #         }), 201
    #
    #         if data == 'End':
    #             end = generateOutput("End")
    #             break
    #             return jsonify({
    #                 "status": "success",
    #                 "message" : end
    #             }), 201
    #
    #         keep_writing = False


# # get API Key from .env file
# client = genai.Client(api_key=config['API_KEY'])
#
# def genarate(paragraph):
#     response = client.models.generate_content(
#         model="gemini-2.0-flash",
#         contents=paragraph,
#         config=types.GenerateContentConfig(
#             system_instruction="You are a Robot. Your name is Jimmy.",
#             max_output_tokens=400,
#             temperature=0.3
#         )
#     )
#
#     retrieve_blog = response.text
#     return retrieve_blog
#
# def display():
#     keep_writing = True
#
#     while keep_writing:
#         # asking user do you want to continue the discussion
#         print('Jimmy the Robot at your service. How can I assist you today?')
#         answer = input('if you want to chat with me simply type Start (If you want to end the chat simply type End) ')
#         while answer != 'End':
#             paragraph = input('What do you want to talk about? ')
#             print(genarate(paragraph))
#             if paragraph == 'End':
#                 break
#
#         keep_writing = False

@app.route('/input')
def test():
    input_va = request.args.get('input')
    return jsonify({'input': input_va})

if __name__ == '__main__':
    app.run(port=8080, debug=True)


