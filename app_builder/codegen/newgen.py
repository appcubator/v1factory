# every app model should have a valid name and write functions
import unittest
import re

def extract_from_brace(s):
  m = re.match(r'\{\{(.+)\}\}', s)
  if m is None: return None
  else:
    return m.groups()[0]

def url_parts_to_regex(url_parts):
  id_regex = r'(\d+)'
  def repl_model_with_id_regex(s):
    if extract_from_brace(s) is not None: # there is a model here.
      return id_regex
    else:
      return s
  return '^' + '/'.join(map(repl_model_with_id_regex, url_parts)) + '$'

APP_NAME = "twitter"

class Page:

  @staticmethod
  def get_required_queries(template):
    qs = []

    if 'uielements' not in template:
      template['uielements'] = []

    for uie in template['uielements']:
      if uie['container_info'] is not None and uie['container_info']['action'] == 'show':
        qs.append('{}.objects.all()'.format(uie['container_info']['entity']))
    return qs

  def __init__(self, urls_d, analyzed_app):
    self.name = urls_d['page_name']
    self.url_parts = urls_d['urlparts']
    self.url_data = filter(lambda x: x is not None, map(extract_from_brace, self.url_parts)) # the free variables
    print self.name
    self._page_json = [ a for a in analyzed_app.templates if a['name'] == self.name ][0]
    self.queries = Page.get_required_queries(self._page_json)

    if 'uielements' not in self._page_json:
      self._page_json['uielements'] = []

    self.uielements = self._page_json['uielements']

    if 'access_level' not in self._page_json:
      self._page_json['access_level'] = "all"

    self.access_level = self._page_json['access_level']

def get_required_fields_from_model(entity):
  """Convenience function that does what it says"""
  return [ f for f in entity['fields'] if f['required']]

class Form:
  """a Form in an app indicates that a user will modify/create data,
       and html forms will be used to make those changes."""

  def __init__(self, form_container, form_id, parent_page):
    """Grab the entity and included fields"""
    self.form_id = form_id
    self.entity = form_container['container_info']['entity']
    self.parent_page = parent_page

    self.included_fields = []
    for uie in form_container['container_info']['uielements']:
      # grab the "name" attribute, it is indicative of the model fields
      if uie['tagname'] in ['input', 'textarea']:
        self.included_fields.append(uie['attrib']['name'])

class AnalyzedApp:

  def __init__(self, app_state, app_name):
    self.name = app_name
    self.classes = app_state['entities']
    self.templates = app_state['pages']
    self.urls = app_state['urls']
    self.user_settings = app_state['users']
    self.forms = []

    self.pages = [ Page(d, self) for d in self.urls ]
    for p in self.pages:
      for i, uie in enumerate(p.uielements):
        if uie['container_info'] is not None and uie['container_info']['action'] == 'create':
          if uie['container_info']['entity'] == "User": continue
          if uie['container_info']['entity'] == "Session": continue
          form_obj = Form(uie, i, p)
          uie['container_info']['form'] = form_obj
          self.forms.append(form_obj)


class Manager:
  """
  Manages a collection of objects
  """

  def __init__(self, parent_class):
    self._parent_class = parent_class
    self._objects = []

  def search_by_name(self, name):
    """
    Given the name of the object, returns the object. Assumes uniqueness on name.
    """
    for o in self._objects:
      if o.name == name:
        return o
    return None

  def _add_unchecked(self, instance):
    self._objects.append(instance)

  def add(self, instance):
    """
    Add an object to this manager if it's the correct type, and avoid duplicates.
    """
    if not isinstance(instance, self._parent_class):
      raise Exception("Object and manager types do not agree")
    elif self.search_by_name(instance.name) is not None:
      raise Exception("Object with this name already exists in the manager")
    else:
      self._add_unchecked(instance)

class Import:
  """
  Represents an imported module, function, or object
  """

  def __init__(self, name, identifier, import_line):
    self.name = name
    self.identifier = identifier
    self.import_line = import_line
    self.objects = Manager(Import)

# import has a name, an identifier, and an import line
# add to the imports, see if an import already exists, things like that.

class ManagerMetaClass(type):

  def __new__(cls, name, bases, dct):
    new_cls = super(ManagerMetaClass, cls).__new__(cls, name, bases, dct)
    new_cls.objects = Manager(new_cls)
    return new_cls

class AppComponent:

  __metaclass__ = ManagerMetaClass

  def __init__(self):
    self.__class__.objects.add(self)

class Model(AppComponent):
  """
  Represents a database model.
  Knows how to write itself as a class.
  """

  def is_valid_name(self):
    return True

  def __init__(self, name, fields):
    self.name = name
    assert(self.is_valid_name())
    self.fields = fields
    super(Model, self).__init__()

  def write(self):
    #render some jinja template.
    pass

class Field(AppComponent):
  """
  Represents a model's field. Has a name, a type, maybe some relationship things, etc.
  """

  _type_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            '_CREATED' : 'DateTime',
            '_MODIFIED' : 'DateTime',
            'email' : 'Email',}

  def is_valid_name(self):
    return True

  def __init__(self, name, field_type, model, required=True, default_value=None, special=""):
    self.name = name
    self.field_type = field_type
    self.required = required
    self.default_value = default_value

    # case on the model type to add the correct type of object as the model
    if isinstance(model, Model):
      self.model = model
    elif isinstance(model, str):
      model_obj = Model.objects.search_by_name(model)
      assert(model_obj is not None)
      self.model = model_obj
    else:
      raise Exception("Didn't recognized the type of the given model (not a Model or str)")

    # ensure the field type is recognized
    if field_type not in Field._type_map:
      raise Exception("This field type is not yet implemented: %s" % field_type)
    super(Field, self).__init__()

  def identifier(self):
    """What will this field be referred to as a variable?"""
    return "m_" + self.name

  def django_type(self):
    return Field._type_map[self.field_type]

  def args(self):
    return []

  def kwargs(self):
    kwargs = {}
    if self.field_type == '_CREATED':
      kwargs['auto_now_add'] = repr(True)
    elif self.field_type == '_MODIFIED':
      kwargs['auto_now'] = repr(True)
    if not self.required:
      kwargs['blank'] = repr(True)
    if self.default_value is not None:
      kwargs['default'] = repr(self.default_value)
    return kwargs

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.codegen', 'code_templates'))
    template = env.get_template('model_fields.py')
    return template.render(f = self)

class Writer:

  def __init__(self, app):
    self.app = app

  def render_template(name, context):
    pass
