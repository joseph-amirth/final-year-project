from utils.http_client_utils import inform_admin_of_anomaly
from tensorflow.keras.models import load_model

model = load_model('init_model.h5')


def get_model():
    global model
    return model


def update_model(new_model):
    global model
    model = new_model


def predict(info):
    global model

    arr = []
    arr.append(info['PROTOCOL'])
    arr.append(info['IN_BYTES'])
    arr.append(info['OUT_BYTES'])
    arr.append(info['IN_PKTS'])
    arr.append(info['OUT_PKTS'])
    arr.append(info['FLOW_DURATION_MILLISECONDS'])

    result = model.predict([arr], verbose=0)
    info['PROB'] = round(result[0][1] * 100, 2)
    # print(info['PROB'])
    if info['PROB'] > 20:
        inform_admin_of_anomaly(info)


# print(model.predict([[6, 43000, 2000, 50, 25, 800]]))
# print(model.predict([[6, 3000, 1700, 30, 30, 750]]))
