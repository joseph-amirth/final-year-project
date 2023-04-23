import pickle
from tensorflow.keras.utils import to_categorical
from sklearn.preprocessing import StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.models import Model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.layers import Dense
import pandas as pd
import numpy as np

from utils.model_utils import get_model, update_model


def gaussian_noise(intrusion_data, data_label):
    mu, sigma = 0, 0.1
    noise_list = []

    for i in range(100):
        noise = np.random.normal(mu, sigma, [1, 6])
        lst = [float(x) for x in str(noise).strip('[]').split()]
        data_with_noise = [x + y for x, y in zip(lst, intrusion_data)]
        noise_list.append(data_with_noise)

    x_train = np.empty((0, 6))
    y_train = np.array([])

    for i in noise_list:
        x_train = np.concatenate((x_train, [i]), axis=0)
        y_train = np.append(y_train, data_label)

    return x_train, y_train


def retrain_model(intrusion_data, data_label):

    with open('scaler_params.pkl', 'rb') as f:
        mean, std = pickle.load(f)
        scaler = StandardScaler()
        scaler.mean_ = mean
        scaler.scale_ = std

    # load the current model
    model = get_model()

    # freeze all layers except the last one
    for layer in model.layers[:-1]:
        layer.trainable = False

    # create a new model with the same architecture as the pre-trained model
    transfer_model = Sequential()
    for layer in model.layers[:-1]:
        transfer_model.add(layer)

    # add a new trainable layer
    transfer_model.add(Dense(2, activation='softmax', name="dense_layer"))

    # compile the model
    transfer_model.compile(loss='binary_crossentropy',
                           optimizer='adam', metrics=['accuracy'])

    x_train, y_train = gaussian_noise(intrusion_data, data_label)

    y_train = to_categorical(y_train, num_classes=2)

    x_train = scaler.transform(x_train)

    # fit the transfer model
    transfer_model.fit(
        x_train, y_train, epochs=25, batch_size=16, validation_split=0.2)

    update_model(transfer_model)

    new_data = [intrusion_data]
    # x1_pred_norm = scaler.fit_transform(new_data)
    X_pred_norm = scaler.transform(new_data)
    predicted_prob = transfer_model.predict(X_pred_norm)
    print(predicted_prob)
