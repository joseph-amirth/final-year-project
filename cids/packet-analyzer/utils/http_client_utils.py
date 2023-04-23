import requests
import ipfsApi

from utils.serialize_utils import serialize

base_url = 'http://localhost:3000/api'
inform_url = f'{base_url}/inform'


def inform_admin_of_anomaly(info):
    response = requests.post(f'{inform_url}/anomaly', info)
    # print(response.text)


def inform_admin_of_intrusion(info):
    response = requests.post(f'{inform_url}/intrusion', info)
    # print(response.text)


def add_local_model(old_model, new_model):
    client = ipfsApi.Client('127.0.0.1', 5001)

    old_model_str = serialize(old_model)
    prev_cid = client.add_str(old_model_str)

    new_model_str = serialize(new_model)
    new_cid = client.add_str(new_model_str)

    response = requests.post(f'{base_url}/localmodel/add', {
        'prevCID': prev_cid,
        'CID': new_cid,
    })
    print(response.text)


def update_global_model(model):
    client = ipfsApi.Client('127.0.0.1', 5001)

    model_str = serialize(model)
    cid = client.add_str(model_str)

    response = requests.post(f'{base_url}/globalmodel/updatecid', {
        'CID': cid,
    })
    print(response.text)
    return cid
