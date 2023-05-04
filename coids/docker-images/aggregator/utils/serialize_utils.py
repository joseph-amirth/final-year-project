import json
import numpy as np
from tensorflow.keras.models import model_from_json


def serialize(model):
    model_config = model.to_json()

    model_dict = {
        'config': model_config,
        'weights': [layer.tolist() for layer in model.get_weights()],
    }

    model_str = json.dumps(model_dict)
    return model_str


def deserialize(model_str):
    model_dict = json.loads(model_str)
    model_reconstructed = model_from_json(model_dict['config'])
    model_reconstructed.set_weights(
        [np.asarray(layer) for layer in model_dict['weights']])
    return model_reconstructed
