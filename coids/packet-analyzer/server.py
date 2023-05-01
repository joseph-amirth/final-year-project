import threading

from flask import Flask, request
import pandas as pd

from utils.aggregate_utils import aggregate_models
from utils.retrain_utils import retrain_model

app = Flask(__name__)


@app.route('/api/retrain', methods=['POST'])
def retrain():
    assert request.headers['Content-Type'] == 'application/json'

    info = request.get_json()

    arr = []
    arr.append(float(info['PROTOCOL']))
    arr.append(float(info['IN_BYTES']))
    arr.append(float(info['OUT_BYTES']))
    arr.append(float(info['IN_PKTS']))
    arr.append(float(info['OUT_PKTS']))
    arr.append(float(info['FLOW_DURATION_MILLISECONDS']))

    retrain_model(arr, pd.Series([0 if info['label'] == 'benign' else 1]))

    return 'Successfully retrained the local model.'


@app.route('/api/aggregate', methods=['POST'])
def aggregate():
    assert request.headers['Content-Type'] == 'application/json'

    info = request.get_json()
    cid = aggregate_models(info)

    return cid


def start_app():
    app.run(debug=True)


if __name__ == '__main__':
    from sniff import watch_snort3

    thread = threading.Thread(target=watch_snort3)
    thread.start()

    start_app()
