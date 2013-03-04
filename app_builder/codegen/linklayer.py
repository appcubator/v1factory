# The link layer is where the json turns into a collection of python objects interlinked memory references
# When the app json schema changes, we change this, keeping the same exposed interface,
#       so we won't have to change the django code writer.

import re

""" MODELS """
class Model:
  """User, Profile, Student, Book, Rental, anything you name it."""
  def __init__(self, entity):
    self.name = entity['name']
    self.fields = [ Field(f, self) for f in entity['fields'] ]

class Field:
  """A Field belongs to a model and has a name and type"""
  def __init__(self, field, model=None):
    self.name = field['name']
    self.required = field['required']
    self.content_type = field['type']
    self.model = model

""" PAGES """
class Page:
  """A page is a list of UIElements, and has a URL where it can be reached."""
  def __init__(self, page):
    self.name = page['name']
    self.access_level = page['access_level']
    self.uielements = []
    for uie in page['uielements']:
      self.uielements.append(UIElement.create(uie))

class Route:
  """A Route is exactly what you think, except it can sometimes have dynamic inputs,
      which link to model fields. Ie /user/:user_id/"""
  def __init__(self, url):
    self.page_name = url['page_name']
    self.urlparts = url['urlparts']

class UIElement:
  """A UIElement is either a Container or Node."""

  @classmethod
  def create(cls, uie):
    if uie['container_info'] is None:
      u = Node(uie)
    else:
      u = Container.create(uie)
    return u

class Node(UIElement):
  """A Node can be thought of as a single element on the page.
      h1, a, p, img, button, are all examples.
     Nodes may reference data from a model."""

  def __init__(self, uie):
    self.lib_id = uie['lib_id']

    self.width = uie['layout']['width']
    self.height = uie['layout']['height']
    self.top = uie['layout']['top']
    self.left = uie['layout']['left']

    self.attribs = uie['attribs']
    self.content = uie['content']

# abstract
class Container(UIElement):
  """A Container is a list of Nodes that have a common purpose.
     A container is either a modelform, loginform, editform, createform, or querysetwrapper"""

  @classmethod
  def create(cls, uie):
    if uie['action'] in ['login', 'signup', 'create', 'edit']:
      u = Form.create(uie)
    elif uie['action'] == 'show':
      u = QuerysetWrapper(uie)
    else:
      raise Exception("Unknown container action \"%s\"" % uie['action'])

    return u

# abstract
class Form(Container):
  """Either a login, signup, create model instance, or edit instance form"""

  @classmethod
  def create(cls, uie):
    pass

class LoginForm(Form):
  """A standard login form."""
  pass

class SignupForm(Form):
  """A standard signup form."""
  pass

class EditForm(Form):
  """Edit a model instance form."""
  pass

class CreateForm(Form):
  """Create a model instance form."""
  pass





class AnalyzedApp:

  def __init__(self, app_state):
    pass
# given user settings, create some models
# create models from app_state entities
# create pages from app_state pages
# create urls from app_state urls

# try to link urls and pages by giving pages some info about the url data, and by giving the url object a reference to the page.


