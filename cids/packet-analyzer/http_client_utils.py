import requests

base_url = 'http://localhost:3000/api/detect/'


def inform_admin_of_anomaly(info):
    return
    response = requests.post(f'{base_url}/anomaly', info)
    print(response.text)


def inform_admin_of_intrusion(info):
    return
    response = requests.post(f'{base_url}/intrusion', info)
    print(response.text)
