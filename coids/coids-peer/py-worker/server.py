from flask import Flask, request
from aggregate_utils import aggregate_models

app = Flask(__name__)


@app.route('/api/aggregate', methods=['POST'])
def aggregate():
    assert request.headers['Content-Type'] == 'application/json'
    json = request.get_json()
    aggregate_models(json)
    return 'ok'


if __name__ == '__main__':
    app.run()
