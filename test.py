import urllib.request
try:
    with urllib.request.urlopen('http://127.0.0.1:8000/predictions?city=Delhi') as response:
        with open('debug.json', 'w') as f:
            f.write(response.read().decode('utf-8'))
except Exception as e:
    with open('debug.json', 'w') as f:
        f.write(str(e))
