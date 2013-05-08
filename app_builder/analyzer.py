# Turns the json into a collection of python objects interlinked memory references
# When the app json schema changes, we change this, keeping the same exposed interface,
#       so we won't have to change the django code writer.

import re
import logging
logger = logging.getLogger("app_builder")
from manager import Manager
import simplejson
from app_builder import utils


def process_link_lang(s):
  m = re.match(r"internal://(.+)$", s)
  if m:
    unprocessed = m.group(1)
    tokens = unprocessed.split('/')
    target_page_name = tokens[0]
    return target_page_name
  else:
    raise Exception('this is not even a proper language bro: %s' % s)



""" MODELS """

class Model(object):
  """User, Profile, Student, Book, Rental, anything you name it."""
  def __init__(self, name=None, fields=None):
    self.name = name
    self.fields = fields

  @classmethod
  def create(cls, entity):
    self  = cls(name=entity['name'])
    # create fields
    self.fields = []
    for f_dict in entity['fields']:
      f = Field.create_for_model(f_dict, self)
      self.fields.append(f)
    return self

  @classmethod
  def create_user(cls, entity):
    self = cls.create(entity)
    username_field = None
    for f in self.fields:
      if f.name == 'username':
        assert f.content_type == "text"
        return self
    raise Exception("A user without a field called \"username\" is not allowed")


class Field(object):
  """A Field belongs to a model and has a name and type"""
  def __init__(self, name=None, required=None, content_type=None, model=None):
    self.name = name
    self.required = required
    self.content_type = content_type
    self.model = model

  @classmethod
  def create_for_model(cls, field_dict, model):
    self = cls(name = field_dict['name'],
               required = field_dict['required'],
               content_type = field_dict['type'],
               model = model)

    # if it's not a normal field, it must be a list of models field, or it's unrecognized.
    if self.content_type not in ['text', 'number', 'date', '_CREATED', '_MODIFIED', 'email', 'image']:
      list_of_model_name = utils.extract_from_brace(field_dict['type']) # "{{Blog}}" => "Blog"
      assert list_of_model_name is not None, "Field type not recognized: %s" % self.content_type
      self.content_type = 'list of blah'
      # this field only exists if content_type = list of blah. in an instance attribute
      self.related_model_name = list_of_model_name
    assert self.content_type in ['text', 'number', 'date', '_CREATED', '_MODIFIED', 'email', 'image', 'list of blah']
    return self

  def resolve_model_if_list_of_blah(self, analyzed_app):
    models = analyzed_app.models
    if self.content_type == "list of blah":
      m = models.get_by_name(self.related_model_name)
      self.related_model = m
      assert m is not None, 'Model has a list of "%s", which is nonexistent AFAIK.' % model_name

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

    # navbar
    try:
      self.navbar = page['navbar']
    except KeyError:
      print "WTF IS THIS? dump: %s" % page
    self.navbar_brandname = None
    if page['navbar']['brandName'] is not None:
      self.navbar_brandname = page['navbar']['brandName']
    self.has_navbar = page['navbar']['isHidden']
    self.navbar_page_names = [ i['name'] for i in page['navbar']['items'] ]

  def resolve_navbar_pages(self, analyzed_app):
    self.navbar_pages = []
    for pname in self.navbar_page_names:
      p = analyzed_app.pages.get_by_name(process_link_lang(pname))
      assert p is not None
      self.navbar_pages.append(p)

class Route(object):
  """A Route is exactly what you think, except it can sometimes have dynamic inputs,
      which link to model fields. Ie /user/:user_id/"""
  def __init__(self, url, page):
    self.name = page.name
    self.page = page
    self.urlparts = url['urlparts']

  def is_static_url(self):
    for u in self.urlparts:
      if not(isinstance(u, str) or isinstance(u, unicode)):
        return True
    return False

  def static_url(self):
    # if the url is static, just display it. else, return "DYNAMIC URL"
    if not self.is_static_url():
        assert False
        return "/DYNAMIC_URL"
    return "/" + "/".join(self.urlparts)



""" UIEls """

class Renderable(object):
  """ Mixin representing a context that can render itself into a given
  environment. """
  def render(self, env):
    template_name = "{}.html".format(type(self).__name__.lower())
    env.globals.update(zip=zip)
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
      self.alignment = "left";
      if 'alignment' in uie['layout']:
        self.alignment = uie['layout']['alignment']
    else:
      assert False
      self.width = 5
      self.height = 5
      self.left = 5
      self.top = 5

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
      assert False
      self.tagname = "LOL" # this is the old system..

    self.html_id = ""


    self.attribs = {}
    if 'content_attribs' in uie:
      self.attribs.update(uie['content_attribs'])
    if 'cons_attribs' in uie:
      self.attribs.update(uie['cons_attribs'])
    self._content = uie['content']

    self.wrap_link = False # this may change after resolve_links

  @classmethod
  def create_list_entry(cls, uie, page):
    self = cls(uie, page)
    style_string = ''

    # this is positioning elements inside a list-entry
    self.wrapper_position_string = "left: %spx; top: %spx; " % (80 * self.left, 15 * self.top)

    return self

  @property
  def classes(self):
      classes = ["span{}".format(self.width), "hi{}".format(self.height)]

      return classes

  def content(self):
    if self._content is not None:
      return self._content.replace('\n','<br>')
    else:
      return ""

  def set_content(self, text):
    self._content = text

  def is_normal_tag(self):
    return self.tagname not in ['img', 'input']

  def resolve_links(self, pages):
    if 'href' in self.attribs:
      if self.attribs['href'].startswith('internal'):
        target_page_name = process_link_lang(self.attribs['href'])
        p = pages.get_by_name(target_page_name)
        if p is None:
          raise Exception("Bad link reference: {}".format(target_page_name))
        self.attribs['href'] = p
      else:
        if not self.attribs['href'].startswith('http'): # prepend http the the href if it's not there
          self.attribs['href'] = 'http://' + self.attribs['href']

  def padding_string(self):
    tp, rp, bp, lp = (0, 0, 0, 0)
    if 't-padding' in self.uie['layout']:
      tp = self.uie['layout']['t-padding']
    if 'r-padding' in self.uie['layout']:
      rp = self.uie['layout']['r-padding']
    if 'b-padding' in self.uie['layout']:
      bp = self.uie['layout']['b-padding']
    if 'l-padding' in self.uie['layout']:
      lp = self.uie['layout']['l-padding']
    return "padding: {}px {}px {}px {}px;".format(tp, rp, bp, lp)

# abstract
class Container(UIElement):
  """A Container is a list of Nodes that have a common purpose.
     A container is either a modelform, loginform, editform, createform, or querysetwrapper"""

  @classmethod
  def create(cls, uie, page):
    if uie['container_info']['action'] in ['login', 'signup', 'create', 'edit',]:
      u = Form.create_subform(uie, page)
    elif uie['container_info']['action'] == 'show':
      u = ListQuerysetWrapper(uie, page)
    elif uie['container_info']['action'] == 'table':
      u = TableQuerysetWrapper(uie, page)
    elif uie['container_info']['action'] in ['facebook', 'twitter', 'linkedin']:
      u = ThirdPartyLogin(uie, page)
    else:
      raise Exception("Unknown container action \"%s\"" % uie['container_info']['action'])

    return u

  def resolve_links(self, pages, *args, **kwargs):
    try:
      for n in self.nodes:
        n.resolve_links(pages, *args, **kwargs)
    except AttributeError:
      pass

  def __init__(self, uie=None):
    super(Container, self).__init__(uie=uie)

class FormField(object):
  """
  Form receiver does something with these.
  """

  def __init__(self, name=None, field_type=None, display_type=None, kwargs=None, options=None,\
                                                        model_field=None, label=None):
    self.name = name
    self.field_type = field_type
    self.display_type = display_type
    self.kwargs = kwargs
    self.options = options
    self.model_field = model_field
    self.label = label

  def is_model_field(self):
    return self.model_field is not None

  @classmethod
  def create(cls, field_dict):
    kwargs = {}
    kwargs['placeholder'] = field_dict['placeholder']
    self = cls(name = field_dict['name']
             , field_type = field_dict['type']
             , display_type = field_dict['displayType']
             , label = field_dict['label']
             , kwargs = kwargs
             , options = field_dict['options'])
    return self

# abstract
class Form(Container):
  """Either a login, signup, create model instance, or edit instance form"""

  required_fields = []

  def __init__(self, name=None, action=None, fields=None, ui_fields=None, entity_name=None, uie=None, page=None,\
                                                      redirect_page_name=None):
    super(Form, self).__init__(uie=uie)
    self.name = name
    self.action = action
    self.included_fields = fields
    self.ui_fields = ui_fields
    self.entity = entity_name
    self.uie = uie
    self.page = page
    self.nodes = []

    if redirect_page_name is None:
      self.redirect_page_name = "internal://Homepage"
    else:
      self.redirect_page_name = redirect_page_name

    # self.entity is set in the resolve function

  @classmethod
  def create(cls, uie, page):
    field_dicts = uie['container_info']['form']['fields']

    # buttons allowed here:
    all_fields = [ FormField.create(f) for f in field_dicts ]
    # but not here
    relevant_fields = [ f for f in all_fields if f.field_type != 'button' ]

    self = cls(name=uie['container_info']['form']['name'],
               action=uie['container_info']['form']['action'],
               entity_name=uie['container_info']['entity'],
               uie=uie,
               ui_fields=all_fields,
               fields=relevant_fields,
               page=page,
               redirect_page_name = uie['container_info']['form']['goto'])

    return self

  def check_required_fields(self):
    for f in self.__class__.required_fields:
      assert f in [ x.name for x in self.included_fields ],\
          "Required field \"%s\" not found in instance of \"%s\"" % (f, self.__class__.__name__)

  @classmethod
  def create_subform(cls, uie, page):
    action_map = { "signup" : SignupForm,
                   "login" : LoginForm,
                   "create" : CreateForm,
                   "edit": EditForm }

    sub_cls = action_map[ uie['container_info']['action'] ]
    self = sub_cls.create(uie, page)

    return self

  def resolve_entity(self, analyzed_app):
    """Links the fields in the form dict to the actual model fields"""

    self.model = analyzed_app.models.get_by_name(self.entity)
    assert self.model is not None, "Model not found: %s" % self.entity

    # these are the fields from the form dict
    self.action = self.action
    f_manager = Manager(Field)
    # these are the fields from self.model
    f_manager._objects = self.model.fields
    for f in self.included_fields:
      f_check = f_manager.get_by_name(f.name)
      if f_check is None:
        assert f.name in ['password1','password2', 'password'], "ruh roh, field called %s is not an actual field in the model" % f.name
      f.model_field = f_check

  def resolve_goto_page(self, analyzed_app):
    self.redirect_page = analyzed_app.pages.get_by_name(process_link_lang(self.redirect_page_name))
    assert self.redirect_page is not None, "could not find redirect page: %s" % self.redirect_page_name

class LoginForm(Form):
  required_fields = ("username", "password")
  pass

class SignupForm(Form):
  required_fields = ("username", "password1", "password2", "email")
  pass

class EditForm(Form):
  pass

class CreateForm(Form):

  @classmethod
  def create(cls, uie, page, *args, **kwargs):
    self = super(CreateForm, cls).create(uie, page, *args, **kwargs)
    self.belongs_to = uie['container_info']['form']['belongsTo'] # Let this be a string
    return self

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
    query = uie['container_info']['query']
    self.fields = query['fieldsToDisplay']
    self.user_filter = query['belongsToUser']
    #self.model = utils.extract_from_brace(query['belongsTo'])
    self.sort_on = query['sortAccordingTo']
    self.nrows = query['numberOfRows']

  def resolve_entity(self, analyzed_app):
    self.entity = analyzed_app.models.get_by_name(self.entity_name)

class TableQuerysetWrapper(QuerysetWrapper):
  def __init__(self, uie, page):
    super(TableQuerysetWrapper, self).__init__(uie, page)

class ListQuerysetWrapper(QuerysetWrapper):
  def __init__(self, uie, page):
    super(ListQuerysetWrapper, self).__init__(uie, page)
    self.row_left = uie['container_info']['row']['layout']['left']
    self.row_top = uie['container_info']['row']['layout']['top']
    self.row_width = uie['container_info']['row']['layout']['width']
    self.row_height = uie['container_info']['row']['layout']['height']
    self.nodes = [ Node.create_list_entry(n, page) for n in uie['container_info']['row']['uielements'] ]

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
    logger.info("Converting app state to analyzed app.")
    self.models = Manager(Model)
    self.pages = Manager(Page)
    self.routes = Manager(Route)

    logger.debug("Adding user fields to the analyzed app.")
    base_user = { "name": "User" }
    if app_state['users']['local']:
      self.local_login = True
      base_user['fields'] = app_state['users']['fields']
      assert len([ f for f in base_user['fields'] if f['name'].lower() in ['username', 'email', 'First Name', 'Last Name']]) == 0, "Plz get rid of username field from user fields."
      base_user['fields'].append(simplejson.loads(r"""{"name": "username","required": true,"type": "text"}""")) # adds username
      base_user['fields'].append(simplejson.loads(r"""{"name": "email","required": true,"type": "text"}"""))
      base_user['fields'].append(simplejson.loads(r"""{"name": "First Name","required": true,"type": "text"}"""))
      base_user['fields'].append(simplejson.loads(r"""{"name": "Last Name","required": true,"type": "text"}"""))
      m = Model.create_user(base_user)
      self.models.add(m)

    if app_state['users']['facebook']:
      self.facebook_login = True

    logger.debug("Adding entities to the analyzed app.")
    for ent in app_state['entities']:
      m = Model.create(ent)
      self.models.add(m)
    logger.debug("Initing entities.")
    self.init_models()

    # create pages from app_state pages
    logger.debug("Adding pages to the analyzed app.")
    for p in app_state['pages']:
      page = Page(p)
      self.pages.add(page)
      logger.debug("Adding route for a page.")
      u = p['url']
      r = Route(u, page)
      self.routes.add(r)
      # this shouldn't be here, but who cares
      if page.navbar_brandname is None:
        logger.debug("Navbar set to app name.")
        page.navbar_brandname = app_state['name']
      # (ensures all navbar brandnames are strings)

    logger.debug("Resolving internal links in navbar.")
    for p in self.pages.each():
      p.resolve_navbar_pages(self)

    logger.debug("Resolving the models in URLs.")
    self.link_models_to_routes()
    logger.debug("Resolving the routes and pages.")
    self.link_routes_and_pages()
    logger.debug("Resolving links in nodes.")
    self.fill_in_hrefs()
    logger.debug("Resolving forms: entity, required fields, goto page.")
    self.init_forms()
    logger.debug("Resolving entities in the lists and tables.")
    self.init_queries(app_state)

  # link routes and models
  def link_models_to_routes(self):
    for r in self.routes.each():
      r.models = Manager(Model)

      for idx, u in enumerate(r.urlparts):
        # if this string resembles a model type thing, replace it with a model
        if utils.extract_from_brace(u) is not None:
          m = self.models.get_by_name(utils.extract_from_brace(u))
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
    for m in self.models.each():
        for f in m.fields:
          f.resolve_model_if_list_of_blah(self)

  def init_forms(self):
    self.forms = Manager(Form)
    for p in self.pages.each():
      for uie in p.uielements:
        if isinstance(uie, Form):
          uie.resolve_entity(self)
          uie.check_required_fields()
          uie.resolve_goto_page(self)

          # hack to make form names unique
          form_counter = 0
          def make_unique(name, level=0):
            if self.forms.get_by_name(name) is None:
              return name
            elif level == 0:
              name += p.name + " page"
              return make_unique(name, level=1)
            else:
              name += str(form_counter)
              form_counter += 1
              return name

          uie.name = make_unique(uie.name)
          self.forms.add(uie)

  def init_queries(self, app_state):
    for p in self.pages.each():
      p.queries = Manager(QuerysetWrapper)
      for uie in p.uielements:
        if isinstance(uie, QuerysetWrapper):
          uie.resolve_entity(self)
          p.queries.add(uie)
