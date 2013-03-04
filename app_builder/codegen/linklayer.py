# The link layer is where the json turns into a collection of python objects interlinked memory references
# When the app json schema changes, we change this, keeping the same exposed interface,
#       so we won't have to change the django code writer.

import re

class Model:
  """User, Profile, Student, Book, Rental, anything you name it."""
  def __init__(self, entity):
    pass

class Field:
  """A Field belongs to a model and has a name and type"""
  def __init__(self, field):
    pass

class Page:
  """A page is a list of UIElements, and has a URL where it can be reached."""
  def __init__(self, page):
    pass

class URL:
  """A URL is exactly what you think, except it can sometimes have dynamic inputs,
      which link to model fields. Ie /user/:user_id/"""
  def __init__(self, url):
    pass

class UIElement:
  """A UIElement is either a Container or Node."""
  pass

class Node(UIElement):
  """A Node can be thought of as a single element on the page.
      h1, a, p, img, button, are all examples.
     Nodes may reference data from a model."""
  pass

class Container(UIElement):
  """A Container is a list of Nodes that have a common purpose.
     A container is either a modelform, loginform, or db-data scope."""
  pass

class Form(Container):
  """Either a login or signup form"""
  pass

class LoginForm(Form):
  """A standard login form."""
  pass

class SignupForm(Form):
  """A standard signup form."""
  pass
