import pickle
from client import inform_admin

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
    print(model.predict_proba([arr]))
    if result[0] == 1:
        inform_admin(info)

print(model.predict([[6, 43000, 2000, 50, 25, 800]]))
print(model.predict([[6, 3000, 1700, 30, 30, 750]]))

