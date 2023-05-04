from flask import Flask, request
from utils.aggregate_utils import aggregate_models

app = Flask(__name__)


@app.route('/', methods=['GET'])
def is_working():
    return 'Aggregation API is working'


@app.route('/api/aggregate', methods=['POST'])
def aggregate():
    assert request.headers['Content-Type'] == 'application/json'

    info = request.get_json()
    cid = aggregate_models(info)

    return cid


if __name__ == '__main__':
    app.run(debug=True)
