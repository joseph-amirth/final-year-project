import ipfsApi
import tensorflow as tf

from utils.serialize_utils import serialize, deserialize


def aggregate_models(json):
    # Get local models from IPFS and deserialize them.
    client = ipfsApi.Client('host.docker.internal', 8080)

    models = []
    for model in json:
        model_str = client.cat(model['CID'])
        model = deserialize(model_str)
        models.append(model)

    # Obtain aggregate model.
    aggregate_model = federated_averaging(models)

    # Serialize the aggregate model and upload it to IPFS.
    client = ipfsApi.Client('host.docker.internal', 5001)

    model_str = serialize(aggregate_model)
    cid = client.add_str(model_str)

    return cid


def federated_averaging(models):
    # Aggregate the model weights.
    avg_weights = []
    for i, _ in enumerate(models[0].get_weights()):
        avg_weights.append(tf.zeros_like(models[0].get_weights()[i]))
        for j in range(len(models)):
            avg_weights[i] += models[j].get_weights()[i]
        avg_weights[i] /= len(models)

    # Create a new model with the averaged weights.
    new_model = tf.keras.models.clone_model(models[0])
    new_model.set_weights(avg_weights)

    return new_model
