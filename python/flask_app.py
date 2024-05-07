
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, request, Response
from flask_cors import CORS, cross_origin
from music21 import converter
import subprocess, tempfile

app = Flask(__name__)

# This was recommended in a forum post, made no difference
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/abc2xml",methods = ['POST'])
@cross_origin()
def abc2xml():
    theABC = request.data.decode('utf-8')  # Assuming UTF-8 encoding

    abcFile = write_to_temp_text_file(theABC)

    result = run_command("python mysite/abc2xml.py "+abcFile)

    cleanup_temp_file(abcFile)

    return result, 200

@app.route('/midi2xml', methods=['POST'])
@cross_origin()
def midi2xml():

    # Check if the request contains an ArrayBuffer named 'array_buffer' was 400
    if 'array_buffer' not in request.files:
        return 'No ArrayBuffer part', 400

    array_buffer = request.files['array_buffer']

    # Read binary data from the ArrayBuffer
    binary_data = array_buffer.read()

    musicXMLFile = create_temp_file()

    try:
        # Convert MIDI to MusicXML
        musicxml_score = converter.parseData(binary_data, quarterLengthDivisors=(4,6))

        musicxml_score.write('musicxml', fp=musicXMLFile)

        with open(musicXMLFile+".musicxml", 'r') as file:
            file_content = file.read()
    except:
        cleanup_temp_file(musicXMLFile+".musicxml")
        cleanup_temp_file(musicXMLFile)
        return ("Error occured during MIDI to MusicXML",400);

    cleanup_temp_file(musicXMLFile+".musicxml")
    cleanup_temp_file(musicXMLFile)

    # Create a Flask response object with the file content
    response = Response(file_content, status=200, mimetype='text/plain')

    return response

def run_command(command):
    try:
        # Run the command and capture its output
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        # Check if the command was successful
        if result.returncode == 0:
            return result.stdout
        else:
            return f"Error executing command: {result.stderr}"
    except Exception as e:
        return f"An error occurred: {e}"

def create_temp_file():
    # Create a temporary file in 'w+' mode (write mode)
    with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_file:
        # Get the name of the temporary file
        temp_file_name = temp_file.name
    # Return the name of the temporary file
    return temp_file_name


def write_to_temp_text_file(text):
    # Create a temporary file in 'w+' mode (write mode)
    with tempfile.NamedTemporaryFile(mode='w+', delete=False) as temp_file:
        # Write text to the temporary file
        temp_file.write(text)
        # Get the name of the temporary file
        temp_file_name = temp_file.name
    # Return the name of the temporary file
    return temp_file_name

def cleanup_temp_file(temp_file_name):
    # Delete the temporary file
    try:
        import os
        os.remove(temp_file_name)
        print(f"Temporary file '{temp_file_name}' has been cleaned up.")
    except FileNotFoundError:
        print(f"Temporary file '{temp_file_name}' not found.")