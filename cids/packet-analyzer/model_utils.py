import pickle
from http_client_utils import inform_admin_of_anomaly

with open("clf_v3.pkl", 'rb') as file:
    model = pickle.load(file)


def predict(info):
    arr = []
    arr.append(info['PROTOCOL'])
    arr.append(info['IN_BYTES'])
    arr.append(info['OUT_BYTES'])
    arr.append(info['IN_PKTS'])
    arr.append(info['OUT_PKTS'])
    arr.append(info['FLOW_DURATION_MILLISECONDS'])
    result = model.predict([arr])
    info['PROB'] = round(model.predict_proba([arr])[0][1]*100, 2)
    print(model.predict_proba([arr]))
    if result[0] == 0:
        inform_admin_of_anomaly(info)


print(model.predict([[6, 43000, 2000, 50, 25, 800]]))
print(model.predict([[6, 3000, 1700, 30, 30, 750]]))
