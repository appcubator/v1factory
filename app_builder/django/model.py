# Contains all the code to produce an in-memory representation of a django model
# @ksikka


from app_builder.manager import Manager

class DjangoModel(object):
  """
  Represents a database model.
  Knows how to write itself
  Knows how to import itself
  """

  def __init__(self, name=None, fields=None):
    self.name = name # string
    self.fields = fields # djangofield

  @classmethod
  def create(cls, abs_model, analyzed_app):
    """Create a django model from analyzed app stuff"""
    name = abs_model.name
    fields = Manager(DjangoField)
    self = cls(name=name, fields=fields)

    for f in abs_model.fields:
      df = DjangoField(f, self, analyzed_app)
      self.fields.add(df)

    return self

  def foreign_key_name(self):
    return self.name.lower()+"_id"

  def identifier(self):
    if self.name == "User":
      return "UserProfile"
    else:
      return self.name.replace(' ', '_')

  def import_line(self):
    return "from webapp.models import " + self.identifier()

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('model.py')
    return template.render(model = self)

class DjangoField(object):
  """
  Represents a model's field. Has a name, a type, maybe some relationship things, etc.
  """

  _type_map = {'text' : 'Text',
            'number' : 'Float',
            'date' : 'DateTime',
            '_CREATED' : 'DateTime',
            '_MODIFIED' : 'DateTime',
            'email' : 'Email',}

  def __init__(self, field, model, django_app):
    self.name = field.name
    self.field_type = field.content_type
    self.required = field.required

    # case on the model type to add the correct type of object as the model
    if isinstance(model, DjangoModel):
      self.model = model
    elif isinstance(model, str):
      model_obj = DjangoModel.objects.search_by_name(model)
      assert(model_obj is not None)
      self.model = model_obj
    else:
      raise Exception("Didn't recognized the type of the given model (not a DjangoModel or str)")

    # ensure the field type is recognized
    if self.field_type not in DjangoField._type_map:
      raise Exception("This field type is not yet implemented: %s" % self.field_type)

  def identifier(self):
    """What will this field be referred to as a variable?"""
    return "m_" + self.name.replace(" ", "_")

  def django_type(self):
    return DjangoField._type_map[self.field_type]

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
    return kwargs

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('model_fields.py')
    return template.render(f = self)
