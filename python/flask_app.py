
# A very simple Flask Hello World app for you to get started with...

from flask import Flask, request
from flask_cors import CORS, cross_origin
import subprocess, tempfile

app = Flask(__name__)

# This was recommended in a forum post, made no difference
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route("/abc2xml",methods = ['POST'])
@cross_origin()
def abc2xml():
    theABC = request.data.decode('utf-8')  # Assuming UTF-8 encoding

    abcFile = write_text_to_temp_file(theABC)

    #return abcFile, 200

    result = run_command("python mysite/abc2xml.py "+abcFile)

    cleanup_temp_file(abcFile)

    return result, 200

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



def write_text_to_temp_file(text):
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