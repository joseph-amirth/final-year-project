import requests

url = 'http://localhost:3000/api/model/intrusion'

def inform_admin(info):
    response = requests.post(url, info)
    print(response.text)

