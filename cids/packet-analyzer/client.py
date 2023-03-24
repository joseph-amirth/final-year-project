import requests

url = 'http://localhost:3000/api/intrusion/detect'

def inform_admin(info):
    response = requests.post(url, info)
    print(response.text)

