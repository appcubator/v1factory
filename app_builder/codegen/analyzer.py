# Turns the json into a collection of python objects interlinked memory references
# When the app json schema changes, we change this, keeping the same exposed interface,
#       so we won't have to change the django code writer.

import re
from manager import Manager

""" MODELS """

class Model:
  """User, Profile, Student, Book, Rental, anything you name it."""
  def __init__(self, entity):
    self.name = entity['name']
    self.fields = [ Field(f, self) for f in entity['fields'] ]

class Field:
  """A Field belongs to a model and has a name and type"""
  def __init__(self, field, model):
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
    self.design_props = []
    if 'design_props' in page:
      self.design_props = page['design_props']
      if self.design_props is None:
        self.design_props = []
    for uie in page['uielements']:
      self.uielements.append(UIElement.create(uie, self))

class Route:
  """A Route is exactly what you think, except it can sometimes have dynamic inputs,
      which link to model fields. Ie /user/:user_id/"""
  def __init__(self, url):
    self.name = url['page_name']
    self.urlparts = url['urlparts']



""" UIEls """

class UIElement:
  """A UIElement is either a Container or Node."""

  @classmethod
  def create(cls, uie, page):
    if uie['container_info'] is None:
      u = Node(uie, page)
    else:
      u = Container.create(uie, page)
    return u

class Node(UIElement):
  """A Node can be thought of as a single element on the page.
      h1, a, p, img, button, are all examples.
     Nodes may reference data from a model."""

  def __init__(self, uie, page):
    #from v1factory.models import UIElement as LibUI
    #self.lib_id = uie['lib_id']
    self.page = page
    self.uie = uie

    #self.lib_el = LibUI.get_library().get(pk=self.lib_id)
    #self.tagname = self.lib_el.tagname
    if 'tagName' in self.uie:
      self.tagname = self.uie['tagName']
    else:
      self.tagname = "LOL" # this is the old system..

    self.html_id = ""

    self.width = uie['layout']['width']
    self.height = uie['layout']['height']
    self.top = uie['layout']['top']
    self.left = uie['layout']['left']

    self.attribs = uie['attribs']
    self.content_dict = uie['content']

  @property
  def classes(self):
      classes = ["span{}".format(self.width), "hi{}".format(self.height)]

      return classes

  def content(self):
    if 'text' in self.content_dict:
      return self.content_dict['text']
    else:
      return ""

  def is_normal_tag(self):
    return self.tagname not in ['img', 'input']

# abstract
class Container(UIElement):
  """A Container is a list of Nodes that have a common purpose.
     A container is either a modelform, loginform, editform, createform, or querysetwrapper"""

  @classmethod
  def create(cls, uie, page):
    if uie['container_info']['action'] in ['login', 'signup', 'create', 'edit']:
      u = Form.create(uie, page)
    elif uie['container_info']['action'] == 'show':
      u = QuerysetWrapper(uie, page)
    else:
      raise Exception("Unknown container action \"%s\"" % uie['container_info']['action'])

    return u

# abstract
class Form(Container):
  """Either a login, signup, create model instance, or edit instance form"""

  @classmethod
  def create(cls, uie, page):
    # do common form things, like success url, post url, etc.
    if uie['container_info']['action'] == 'login':
      u = LoginForm(uie, page)
    elif uie['container_info']['action'] == 'signup':
      u = SignupForm(uie, page)
    elif uie['aciton'] == 'edit':
      u = EditForm(uie, page)
    elif uie['container_info']['action'] == 'create':
      u = CreateForm(uie, page)

    return u

class LoginForm(Form):
  """A standard login form."""
  def __init__(self, uie, page):
    # put the info here
    self.uie = uie
    self.nodes = uie['container_info']['uielements']
    self.page = page

class SignupForm(Form):
  """A standard signup form."""
  def __init__(self, uie, page):
    # put the info here
    self.uie = uie
    self.nodes = uie['container_info']['uielements']
    self.page = page

class EditForm(Form):
  """Edit a model instance form."""
  def __init__(self, uie, page):
    # put the info here
    self.uie = uie
    self.nodes = uie['container_info']['uielements']
    self.page = page

class CreateForm(Form):
  """Create a model instance form."""
  def __init__(self, uie, page):
    # put the info here
    self.uie = uie
    self.nodes = uie['container_info']['uielements']
    self.page = page

class QuerysetWrapper:
  def __init__(self, uie, page):
    self.uie = uie
    self.nodes = uie['container_info']['uielements']
    self.page = page


""" ANALYZED APP """

class AnalyzedApp:

  def __init__(self, app_state):
    # create "managers" which will help a dev find things inside lists
    self.models = Manager(Model)
    self.pages = Manager(Page)
    self.routes = Manager(Route)

    # given user settings, create some models
    base_user = { "name": "User",
                  "fields": [{ "name": "email",
                               "type": "email",
                               "required": "True" }]}
    if app_state['users']['local']:
      self.local_login = True
      base_user.update(app_state['users']['fields'])
      m = Model(base_user)
      self.models.add(m)

    # create models from app_state entities
    for ent in app_state['entities']:
      m = Model(ent)
      self.models.add(m)

    # create pages from app_state pages
    for p in app_state['pages']:
      page = Page(p)
      self.pages.add(page)

    # create urls from app_state urls
    for u in app_state['urls']:
      r = Route(u)
      self.routes.add(r)

    self.link_models_to_routes()
    self.link_routes_and_pages()
    # will eventually do forms.


  # link routes and models
  def link_models_to_routes(self):
    def extract_from_brace(s):
      "Takes a string out of the brace wrappers"
      m = re.match(r'\{\{(.+)\}\}', s)
      if m is None: return None
      else:
        return m.groups()[0].strip()

    for r in self.routes.each():
      r.models = Manager(Model)

      for idx, u in enumerate(r.urlparts):
        # if this string resembles a model type thing, replace it with a model
        if extract_from_brace(u) is not None:
          m = self.models.get_by_name(extract_from_brace(u))
          r.urlparts[idx] = m
          r.models.add(m)

  # interlink routes and pages
  def link_routes_and_pages(self):
    for r in self.routes.each():
      r.page = self.pages.get_by_name(r.name)
      r.page.route = r


def test():
  from v1factory.models import App
  import validator
  app = App.objects.get(pk=1)
  validator.validate_app_state(app)
  analyzed_app_state = AnalyzedApp(app.state)
  return analyzed_app_state
