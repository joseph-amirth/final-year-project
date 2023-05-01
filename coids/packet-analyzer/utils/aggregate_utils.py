import ipfsApi
import tensorflow as tf

from utils.http_client_utils import update_global_model
from utils.model_utils import update_model
from utils.serialize_utils import deserialize


def aggregate_models(json):
    client = ipfsApi.Client('127.0.0.1', 8080)

    models = []
    for i, model in enumerate(json):
        model_str = client.cat(model['CID'])
        model = deserialize(model_str)
        models.append(model)

    aggregate_model = federated_averaging(models)

    update_model(aggregate_model)

    return update_global_model(aggregate_model)


def federated_averaging(models):
    # aggregate the model weights
    avg_weights = []
    for i, _ in enumerate(models[0].get_weights()):
        avg_weights.append(tf.zeros_like(models[0].get_weights()[i]))
        for j in range(len(models)):
            avg_weights[i] += models[j].get_weights()[i]
        avg_weights[i] /= len(models)

    # create a new model with the averaged weights
    new_model = tf.keras.models.clone_model(models[0])
    new_model.set_weights(avg_weights)

    return new_model
