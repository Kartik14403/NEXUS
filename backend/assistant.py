import os
import webbrowser
import speech_recognition as sr
import pyttsx3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import datetime
import random
import requests
from docx import Document

engine = pyttsx3.init()
engine.setProperty('voice', engine.getProperty('voices')[1].id)
engine.setProperty('rate', 150)
engine.setProperty('volume', 1)
recognizer = sr.Recognizer()

def speak(text):
    try:
        engine.say(text)
        engine.runAndWait()
    except RuntimeError:
        # Safely ignore run-loop errors when called from a web request context
        pass

def listen():
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source)
        speak("Listening...")
        try:
            audio = recognizer.listen(source)
            return recognizer.recognize_google(audio).lower()
        except sr.UnknownValueError:
            speak("Sorry, I didn't get that.")
            return None

def take_input():
    """Fallback function for when input is needed but not available in web context"""
    return "User input not available in web context"

def ask_ollama(prompt, model="gemma:2b"):
    try:
        print(f"\u23f3 Thinking with {model}...")
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": False
        })
        response.raise_for_status()
        reply = response.json().get("response", "Could not fetch data.")
        print(f"\n🤖 {model} says: {reply[:100]}...")
        return reply
    except requests.RequestException as e:
        error = f"Ollama connection error: {e}"
        print(error)
        return None

def get_ai_response(prompt):
    """Get AI response with Ollama gemma:2b model"""
    return get_ai_response_with_model(prompt, "gemma:2b")

def get_ai_response_with_model(prompt, model="gemma:2b"):
    """Get AI response with specified Ollama model"""
    print(f"📝 Processing prompt: {prompt[:50]}...")
    
    # Try Ollama with specified model first
    ollama_response = ask_ollama(prompt, model)
    if ollama_response and "connection error" not in ollama_response.lower():
        print(f"✅ Using Ollama {model} response")
        return ollama_response
    
    # If specified model fails, try with gemma:2b as fallback
    if model != "gemma:2b":
        print(f"⚠️ {model} failed, trying gemma:2b fallback...")
        ollama_response = ask_ollama(prompt, "gemma:2b")
        if ollama_response and "connection error" not in ollama_response.lower():
            print("✅ Using Ollama gemma:2b fallback response")
            return ollama_response
    
    # If Ollama fails, try with a different approach
    print("⚠️ Ollama failed, trying alternative...")
    try:
        # Try a simpler request format
        response = requests.post("http://localhost:11434/api/generate", json={
            "model": model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": 0.7,
                "top_p": 0.9
            }
        }, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            reply = data.get("response", "")
            if reply:
                print("✅ Alternative Ollama request successful")
                return reply
    except Exception as e:
        print(f"❌ Alternative request failed: {e}")
    
    # Final fallback
    print("🔄 Using fallback response")
    return get_fallback_response(prompt)

def get_fallback_response(prompt):
    """Simple fallback responses when AI is not available"""
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ["hello", "hi", "hey"]):
        return "Hello! I'm ARIS, your AI assistant. How can I help you today?"
    
    elif any(word in prompt_lower for word in ["python", "code", "programming"]):
        return "I'd be happy to help you with Python programming! Could you be more specific about what you need help with? For example, are you looking for help with syntax, debugging, or a specific concept?"
    
    elif any(word in prompt_lower for word in ["function", "def"]):
        return "I can help you with Python functions! A basic function structure is:\n\n```python\ndef function_name(parameters):\n    # Function body\n    return result\n```\n\nWhat specific function would you like to create or modify?"
    
    elif any(word in prompt_lower for word in ["sort", "list", "array"]):
        return "I can help you with sorting lists in Python! Here are some common methods:\n\n1. **Built-in sort()**: `my_list.sort()`\n2. **Sorted() function**: `new_list = sorted(my_list)`\n3. **Custom sorting**: `my_list.sort(key=lambda x: x.property)`\n\nWhat type of sorting do you need help with?"
    
    elif any(word in prompt_lower for word in ["help", "assist"]):
        return "I'm here to help! I can assist with:\n- Python programming\n- General questions\n- Code examples\n- Problem solving\n- And much more!\n\nWhat would you like to know?"
    
    elif "?" in prompt:
        return "That's an interesting question! While I don't have access to my full AI capabilities right now, I'd be happy to help you think through this. Could you provide more details about what you're trying to accomplish?"
    
    else:
        return f"I understand you're asking about: '{prompt}'\n\nI'm currently running with limited AI capabilities. For the best experience, please ensure Ollama with gemma:2b is running. I can still help with general questions, Python programming, or provide guidance on various topics. What specific area would you like to explore?"

def write_to_word(content):
    from datetime import datetime
    filename = f"AI_Writing_{datetime.now().strftime('%Y%m%d_%H%M%S')}.docx"
    doc = Document()
    doc.add_paragraph(content)
    try:
        doc.save(filename)
        speak("Content written to Word document.")
        print(f"\u2705 Saved to {filename}")
        os.startfile(filename)
    except PermissionError:
        speak("Permission denied when saving the document. Close the document if it's open and try again.")


def open_item(command):
    if "." in command:
        url = command if command.startswith("http") else f"http://{command}"
        webbrowser.open(url)
        speak(f"Opening website {url}.")
        return f"Opening website {url}."

    if os.path.exists(command):
        os.startfile(command)
        speak(f"Opening {command}.")
        return f"Opening {command}."

    apps = {
        "word": "winword.exe",
        "excel": "excel.exe",
        "powerpoint": "powerpnt.exe",
        "notepad": "notepad.exe",
        "calculator": "calc.exe",
        "control panel": "control",
        "chrome": "chrome.exe",
        "visualstudiocode": "code.exe"
    }
    for app, path in apps.items():
        if app in command:
            os.startfile(path)
            speak(f"Opening {app}.")
            return f"Opening {app}."

    speak("Item not found.")
    return "Item not found."

def calculate_math(expression):
    try:
        expression = expression.replace('plus', '+').replace('minus', '-')
        expression = expression.replace('times', '*').replace('divided by', '/')
        result = eval(expression)
        return result
    except:
        speak("I couldn't solve that.")
        return None

def create_word_document(topic, doc_type):
    doc = Document()
    doc.add_heading(doc_type.capitalize(), level=1)
    if doc_type == "letter":
        content = f"Dear Sir/Madam,\n\nThis letter is regarding {topic}.\n\nRegards,\nYour Assistant."
    else:
        content = f"This essay discusses {topic} and its implications."
    doc.add_paragraph(content)
    file_name = f"{topic}_{doc_type}.docx"
    doc.save(file_name)
    speak(f"{doc_type.capitalize()} created successfully.")
    return f"{doc_type.capitalize()} created successfully."

def send_email():
    speak("Receiver's email?")
    to_email = take_input()
    speak("Subject?")
    subject = take_input()
    speak("Message body?")
    body = take_input()

    from_email = "rohitrevanwar9975@gmail.com"
    password = "Rohit@9975"

    msg = MIMEMultipart()
    msg['From'] = from_email
    msg['To'] = to_email
    msg['Subject'] = subject
    msg.attach(MIMEText(body, 'plain'))

    try:
        with smtplib.SMTP('smtp.gmail.com', 587) as server:
            server.starttls()
            server.login(from_email, password)
            server.send_message(msg)
            speak("Email sent.")
            return "Email sent."
    except Exception as e:
        speak(f"Error sending email: {e}")
        return f"Error sending email: {e}"

def tell_date_time():
    now = datetime.datetime.now()
    speak(f"It's {now.strftime('%I:%M %p')} on {now.strftime('%A, %B %d, %Y')}.")
    return now.strftime("It's %I:%M %p on %A, %B %d, %Y.")

def tell_weather():
    city = "Ambajogai"
    api_key = "your_api_key"
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}"
    response = requests.get(url).json()

    if response.get("cod") != 200:
        speak("Couldn't get weather data.")
        return "Couldn't get weather data."
    else:
        desc = response["weather"][0]["description"]
        temp = response["main"]["temp"] - 273.15
        speak(f"In {city}, it's {desc} and {temp:.1f}°C.")
        return f"In {city}, it's {desc} and {temp:.1f}°C."

def search_web(command):
    if "search google" in command:
        query = command.replace("search google", "").strip()
        webbrowser.open(f"https://www.google.com/search?q={query}")
        speak(f"Googling {query}.")
        return f"Googling {query}."
    elif "search youtube" in command:
        query = command.replace("search youtube", "").strip()
        webbrowser.open(f"https://www.youtube.com/results?search_query={query}")
        speak(f"Searching YouTube for {query}.")
        return f"Searching YouTube for {query}."

def tell_joke():
    jokes = [
        "Why don't skeletons fight each other? They don't have the guts!",
        "Why did the scarecrow win an award? Because he was outstanding in his field!"
    ]
    joke = random.choice(jokes)
    speak(joke)
    return joke

def execute_command(command, model="gemma:2b"):
    """Main command execution function with improved chat handling"""
    command_lower = command.lower().strip()
    
    # Handle specific commands
    if "open" in command_lower:
        return open_item(command.replace("open", "").strip())

    elif "calculate" in command_lower:
        result = calculate_math(command)
        if result is not None:
            print(f"🧲 Result: {result}")
            return f"The result is {result}."

    elif "send email" in command_lower:
        return "Email functionality requires additional setup. Please use a dedicated email client for now."

    elif "create letter" in command_lower:
        return "Letter creation requires additional input. Please specify the topic and recipient details."

    elif "create essay" in command_lower:
        return "Essay creation requires additional input. Please specify the topic and requirements."

    elif "time" in command_lower or "date" in command_lower:
        return tell_date_time()

    elif "weather" in command_lower:
        return tell_weather()

    elif "joke" in command_lower:
        return tell_joke()

    elif "search" in command_lower:
        return search_web(command)

    elif command_lower.startswith("write") and "in word" in command_lower:
        content = command.replace("write", "").replace("in word", "").strip(" '")
        if not content:
            return "Please specify what you'd like me to write."
        write_to_word(content)
        return "Written to Word document."

    else:
        # Handle general chat messages with specified model
        response = get_ai_response_with_model(command, model)
        print(f"\n🤖 ARIS ({model}): {response}")
        return response

def main():
    speak("Hello! I am your assistant ARIS. What can I help you with?")
    while True:
        command = take_input()
        if command in ["exit", "quit", "stop"]:
            speak("Goodbye!")
            break
        if command:
            execute_command(command)

# if __name__ == "__main__":
#     main()