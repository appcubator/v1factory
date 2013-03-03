# every app model should have a valid name and write functions
import unittest

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
