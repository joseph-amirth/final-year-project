import json
import numpy as np
from tensorflow.keras.models import model_from_json


def serialize(model):
    model_json_str = model.to_json()

    model_dict = {
        'config': model_json_str,
        'weights': [layer.tolist() for layer in model.get_weights()],
        'dtype': str(model.dtype),
        'input_shape': tuple(model.input.shape[1:]),
        'output_shape': tuple(model.output.shape[1:]),
    }

    model_str = json.dumps(model_dict)
    return model_str


def deserialize(model_str):
    model_dict = json.loads(model_str)
    model_reconstructed = model_from_json(model_dict['config'])
    model_reconstructed.set_weights(
        [np.asarray(layer) for layer in model_dict['weights']])
    return model_reconstructed
