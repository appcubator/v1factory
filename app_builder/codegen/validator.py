model validator
field validator

def models(app_state):
  """Test that the models are valid."""

def views(app_state):
  """Test that the views are valid."""
  # templates should have 

def controller(app_state):
  """Test that the url config is valid."""


def validator(app_state):
  """go through the validation process with an app state"""

  models(app_state)
  views(app_state)
  controller(app_state)
