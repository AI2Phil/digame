import pytest
import torch
import os

# Assuming PredictiveModel, save_model, load_model are in digame.app.predictive
from digame.app.predictive import PredictiveModel, save_model, load_model

def compare_state_dicts(dict1, dict2):
    """Helper function to compare two state dictionaries."""
    if dict1.keys() != dict2.keys():
        return False
    for key in dict1:
        if not torch.equal(dict1[key], dict2[key]):
            return False
    return True

def test_successful_save_load_cycle(dummy_model_and_optimizer, temp_model_path):
    """
    Tests the save_model and load_model functions directly.
    Verifies that a model and optimizer can be saved and then loaded back correctly.
    """
    original_model, original_optimizer = dummy_model_and_optimizer
    model_path_str = str(temp_model_path)

    # Action: Save the model and optimizer
    save_model(original_model, original_optimizer, file_path=model_path_str)
    assert os.path.exists(model_path_str), "Model file was not created by save_model."

    # Action: Create new instances and load the saved state
    # Use the same parameters as in the dummy_model_and_optimizer fixture
    loaded_model = PredictiveModel(
        input_size=dummy_model_and_optimizer[0].lstm.input_size, # Accessing from original_model for clarity
        hidden_size=dummy_model_and_optimizer[0].hidden_size,
        num_layers=dummy_model_and_optimizer[0].num_layers,
        output_size=dummy_model_and_optimizer[0].fc.out_features
    )
    # Create a new optimizer for the loaded model
    # It's important that the optimizer is for the loaded_model's parameters
    loaded_optimizer = torch.optim.Adam(loaded_model.parameters()) 

    # Load the state
    returned_model, returned_optimizer = load_model(loaded_model, loaded_optimizer, file_path=model_path_str)

    # Verification
    assert returned_model is loaded_model, "load_model should return the same model instance it received."
    assert returned_optimizer is loaded_optimizer, "load_model should return the same optimizer instance it received."

    # Compare model state dictionaries
    original_model_sd = original_model.state_dict()
    loaded_model_sd = loaded_model.state_dict()
    assert compare_state_dicts(original_model_sd, loaded_model_sd), \
        "Model state dictionaries do not match after loading."

    # Compare optimizer state dictionaries
    # Note: Optimizer state dict comparison can be tricky if learning rates or other params change.
    # For a simple save/load cycle, they should match.
    original_optimizer_sd = original_optimizer.state_dict()
    loaded_optimizer_sd = loaded_optimizer.state_dict()
    
    # Optimizer state dicts can have device differences in tensors (e.g. 'step').
    # For simplicity, we'll compare the 'param_groups' which holds LR etc.
    # and check if 'state' keys match. More thorough comparison might be needed for complex cases.
    assert len(original_optimizer_sd['param_groups']) == len(loaded_optimizer_sd['param_groups'])
    for i in range(len(original_optimizer_sd['param_groups'])):
        assert original_optimizer_sd['param_groups'][i] == loaded_optimizer_sd['param_groups'][i], \
            f"Optimizer param_groups at index {i} do not match."

    # Check that the keys in 'state' (which holds momentum buffers etc.) are the same.
    # The actual tensor values are harder to compare directly without running steps.
    assert original_optimizer_sd['state'].keys() == loaded_optimizer_sd['state'].keys(), \
        "Optimizer state keys do not match."
    # A more robust check would be to ensure all tensors in the state are equal,
    # but this requires careful handling of devices and potentially running a dummy step.
    # For now, checking structure.
    for k in original_optimizer_sd['state']:
        for sk, sv in original_optimizer_sd['state'][k].items():
            if isinstance(sv, torch.Tensor):
                assert torch.equal(sv, loaded_optimizer_sd['state'][k][sk]), f"Tensor mismatch in optimizer state for {k}/{sk}"
            else:
                assert sv == loaded_optimizer_sd['state'][k][sk], f"Value mismatch in optimizer state for {k}/{sk}"


def test_load_model_file_not_found(dummy_model_and_optimizer, temp_model_path):
    """
    Tests that load_model raises FileNotFoundError when the model file does not exist.
    """
    model, optimizer = dummy_model_and_optimizer
    non_existent_path = str(temp_model_path / "non_existent_model.pth")

    with pytest.raises(FileNotFoundError):
        load_model(model, optimizer, file_path=non_existent_path)
