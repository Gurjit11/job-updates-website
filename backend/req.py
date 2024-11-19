import requests
import json

TOKEN = "7180099069:AAEaKLCxqfiHR3OWiPHioemwWvi08rlQ04w"
GROUP_ID = "1002398471216"

url = f"https://api.telegram.org/bot{TOKEN}/channels.getMessages"
params = {"peer_id": f"grouptype_{GROUP_ID}", "offset": 0, "limit": 1}

response = requests.get(url, params=params)
data = json.loads(response.text)
print("Response:", response.text)
print(data)
latest_message = data["result"]["messages"][0]["message"]["text"]

print(latest_message)
