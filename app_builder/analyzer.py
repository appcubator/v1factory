# Turns the json into a collection of python objects interlinked memory references
# When the app json schema changes, we change this, keeping the same exposed interface,
#       so we won't have to change the django code writer.

import re
from manager import Manager

""" MODELS """

class Model(object):
  """User, Profile, Student, Book, Rental, anything you name it."""
  def __init__(self, entity):
    self.name = entity['name']
    self.fields = [ Field(f, self) for f in entity['fields'] ]

class Field(object):
  """A Field belongs to a model and has a name and type"""
  def __init__(self, field, model):
    self.name = field['name']
    self.required = field['required']
    self.content_type = field['type']
    self.model = model
    self.is_fk = False

  def resolve_entity(self, analyzed_app):
    self.entity = analyzed_app.models.get_by_name(self.entity_name)
    self.included_fields = []
    for f in self.entity.fields:
      if f.name in self.included_field_names:
        self.included_fields.append(f)

  def resolve_foreign_keys(self, analyzed_app):
    def extract_from_brace(s):
      "Takes a string out of the brace wrappers"
      m = re.match(r'\{\{(.+)\}\}', s)
      if m is None: return None
      else:
        return m.groups()[0].strip()

    self.models = analyzed_app.models
    model_check = extract_from_brace(self.content_type)
    if model_check != None:
      for f in self.models:
        if f == model_check:
          self.name = model_check
          self.is_fk = True
          break

""" PAGES """

class Page(object):
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
      for d in self.design_props:
        if d['type'] == 'background-image':
          d['value'] = 'url({})'.format(d['value'])
    for uie in page['uielements']:
      self.uielements.append(UIElement.create(uie, self))

class Route(object):
  """A Route is exactly what you think, except it can sometimes have dynamic inputs,
      which link to model fields. Ie /user/:user_id/"""
  def __init__(self, url):
    self.name = url['page_name']
    self.urlparts = url['urlparts']

  def static_url(self):
    # if the url is static, just display it. else, return "DYNAMIC URL"
    for u in self.urlparts:
      if not(isinstance(u, str) or isinstance(u, unicode)):
        return "/DYNAMIC_URL"
    return "/" + "/".join(self.urlparts)



""" UIEls """

class Renderable(object):
  """ Mixin representing a context that can render itself into a given
  environment. """
  def render(self, env):
    template_name = "{}.html".format(type(self).__name__.lower())
    return env.get_template(template_name).render(context=self, env=env)

class UIElement(Renderable):
  """A UIElement is either a Container or Node."""

  @classmethod
  def create(cls, uie, page):
    if uie['container_info'] is None:
      u = Node(uie, page)
    else:
      u = Container.create(uie, page)
    return u

  def __init__(self, uie=None):
    self.uie = uie
    if 'layout' in uie:
      self.width = uie['layout']['width']
      self.height = uie['layout']['height']
      self.top = uie['layout']['top']
      self.left = uie['layout']['left']
    else:
      self.width = 5
      self.height = 5
      self.left = 5
      self.top = 5
    self.position_css = "position: absolute; left: {}px; top: {}px;".format(self.left*15, self.top*15)

class Node(UIElement):
  """A Node can be thought of as a single element on the page.
      h1, a, p, img, button, are all examples.
     Nodes may reference data from a model."""

  def __init__(self, uie, page):
    super(Node, self).__init__(uie=uie)
    self.page = page
    self.uie = uie

    #self.lib_el = LibUI.get_library().get(pk=self.lib_id)
    #self.tagname = self.lib_el.tagname
    if 'tagName' in self.uie:
      self.tagname = self.uie['tagName']
    else:
      self.tagname = "LOL" # this is the old system..

    self.html_id = ""


    self.attribs = {}
    if 'content_attribs' in uie:
      self.attribs.update(uie['content_attribs'])
    if 'cons_attribs' in uie:
      self.attribs.update(uie['cons_attribs'])
    self._content = uie['content']


  @property
  def classes(self):
      classes = ["span{}".format(self.width), "hi{}".format(self.height)]

      return classes

  def content(self):
    if self._content is not None:
      return self._content
    else:
      return ""

  def set_content(self, text):
    self._content = text

  def is_normal_tag(self):
    return self.tagname not in ['img', 'input']

  def resolve_links(self, pages):
    if 'href' in self.attribs:
      m = re.match(r"\{\{(.+)\}\}$", self.attribs['href'])
      if m:
        link_ref = m.group(1)
        p = pages.get_by_name(link_ref)
        if p is None:
          raise Exception("Bad link reference: {}".format(p))
        self.attribs['href'] = p

# abstract
class Container(UIElement):
  """A Container is a list of Nodes that have a common purpose.
     A container is either a modelform, loginform, editform, createform, or querysetwrapper"""

  @classmethod
  def create(cls, uie, page):
    if uie['container_info']['action'] in ['login', 'signup', 'create', 'edit',]:
      u = Form.create(uie, page)
    elif uie['container_info']['action'] == 'show':
      u = QuerysetWrapper(uie, page)
    elif uie['container_info']['action'] in ['facebook', 'linkedin']:
      u = ThirdPartyLogin(uie, page)
    else:
      raise Exception("Unknown container action \"%s\"" % uie['container_info']['action'])

    return u

  def resolve_links(self, pages, *args, **kwargs):
    for n in self.nodes:
      n.resolve_links(pages, *args, **kwargs)

  def __init__(self, uie=None):
    super(Container, self).__init__(uie=uie)

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
    elif uie['container_info']['action'] == 'edit':
      u = EditForm(uie, page)
    elif uie['container_info']['action'] == 'create':
      u = CreateForm(uie, page)

    return u

  def __init__(self, uie=None):
    super(Form, self).__init__(uie=uie)

class LoginForm(Form):
  """A standard login form."""
  def __init__(self, uie, page):
    super(LoginForm, self).__init__(uie=uie)
    # put the info here
    self.name = "Form{}".format(id(uie))
    self.uie = uie
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.page = page

class SignupForm(Form):
  """A standard signup form."""
  def __init__(self, uie, page):
    super(SignupForm, self).__init__(uie=uie)
    self.name = "Form{}".format(id(uie))
    self.uie = uie
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.verify_required_fields_exist()
    self.page = page

  def verify_required_fields_exist(self):
    field_names = [ n.attribs['name'] for n in self.nodes if 'name' in n.attribs ]
    required_signup_fields = ['name', 'email', 'username', 'password1', 'password2']
    for rf in required_signup_fields:
      try:
        assert(rf in field_names)
      except AssertionError:
        raise Exception("\"{}\" missing as a field in the signup form.".format(rf))

class EditForm(Form):
  """Edit a model instance form."""
  def __init__(self, uie, page):
    self.name = "Form{}".format(id(uie))
    # put the info here
    self.uie = uie
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.page = page

class CreateForm(Form):
  """Create a model instance form."""
  def __init__(self, uie, page):
    super(CreateForm, self).__init__(uie=uie)
    self.name = "Form{}".format(id(uie))
    # put the info here
    self.uie = uie
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.page = page
    self.included_field_names = [ n.attribs['name'] for n in self.nodes if 'name' in n.attribs ]
    self.entity_name = uie['container_info']['entity']

  def resolve_entity(self, analyzed_app):
    self.entity = analyzed_app.models.get_by_name(self.entity_name)
    self.included_fields = []
    for f in self.entity.fields:
      if f.name in self.included_field_names:
        self.included_fields.append(f)


class QuerysetWrapper(Container):
  """A container that wraps some nodes in a for loop, and fills them with data from a query.
  For now that query is to get all the elements from some model."""
  def __init__(self, uie, page):
    super(QuerysetWrapper, self).__init__(uie=uie)
    self.name = "QW{}".format(id(uie))
    self.uie = uie
    self.entity_name = uie['container_info']['entity']
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.page = page

  def resolve_entity(self, analyzed_app):
    self.entity = analyzed_app.models.get_by_name(self.entity_name)

class ThirdPartyLogin(Container):
  """ A container that wraps a third party login action """
  def __init__(self, uie, page):
    super(ThirdPartyLogin, self).__init__(uie=uie)
    self.name = "ThirdParty{}Login{}".format(uie['container_info']['action'].capitalize(), id(uie))
    self.uie = uie
    self.provider = uie['container_info']['action'] # this will be one of 'facebook', 'linkedin'
    self.nodes = [ Node(n, page) for n in uie['container_info']['uielements'] ]
    self.page = page

""" ANALYZED APP """

class AnalyzedApp:

  def __init__(self, app_state):
    # create "managers" which will help a dev find things inside lists
    self.models = Manager(Model)
    self.pages = Manager(Page)
    self.routes = Manager(Route)

    # given user settings, create some models
    base_user = { "name": "User" }
    if app_state['users']['local']:
      self.local_login = True
      base_user['fields'] = app_state['users']['fields']
      m = Model(base_user)
      self.models.add(m)

    if app_state['users']['facebook']:
      self.facebook_login = True

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

    self.init_models()
    self.link_models_to_routes()
    self.link_routes_and_pages()
    self.fill_in_hrefs()
    # will eventually do forms.
    self.init_forms()
    self.init_queries()


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

  def fill_in_hrefs(self):
    for p in self.pages.each():
      for uie in p.uielements:
        uie.resolve_links(self.pages)

  def init_models(self):
    for m in self.models:
      for f in m.fields:
        f.resolve_foreign_keys(self)

  def init_forms(self):
    self.forms = Manager(Form)
    for p in self.pages.each():
      for uie in p.uielements:
        if isinstance(uie, Form):
          self.forms.add(uie)
          if isinstance(uie, CreateForm):
            uie.resolve_entity(self)

  def init_queries(self):
    for p in self.pages.each():
      p.queries = Manager(QuerysetWrapper)
      for uie in p.uielements:
        if isinstance(uie, QuerysetWrapper):
          uie.resolve_entity(self)
          p.queries.add(uie)
