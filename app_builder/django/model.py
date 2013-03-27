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
  def create(cls, abs_model):
    """Create a django model from analyzed app stuff"""
    name = abs_model.name
    fields = Manager(DjangoField)
    self = cls(name=name, fields=fields)

    for f in abs_model.fields:
      if f.content_type != "list of blah":
        df = DjangoField.create(f, self)
        self.fields.add(df)

    return self

  # TODO XXX RENAME THIS FUNCTION, IT'S VERY BADLY NAMED
  def foreign_key_name(self):
    # note, i'm also using this to generate variable names for the url-data in the view
    return self.name.lower()+"_id"

  def identifier(self):
    # FIXME need to do users better... wtf is this
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

  _type_map = {'text' : 'TextField',
            'number' : 'FloatField',
            'date' : 'DateTimeField',
            '_CREATED' : 'DateTimeField',
            '_MODIFIED' : 'DateTimeField',
            'email' : 'EmailField',
            'fk' : 'ForeignKey',
            'm2m' : 'ManyToManyField'}

  def __init__(self, name=None, field_type=None, required=None, model=None, related_name=None, related_model=None):
    self.name = name
    self.field_type = content_type
    self.required = required
    self.model = model
    self.related_model = related_model

  @classmethod
  def create(cls, field, model):
    """Used to create normal (non-relational) fields"""
    self = cls(name=field.name,
               field_type=field.content_type,
               required=field.required,
               model=model)
    # case on the model type to add the correct type of object as the model
    if self.field_type not in DjangoField._type_map and self.field_type != "list of blah": # XXX
      raise Exception("This field type is not yet implemented: %s" % self.field_type)
    return self

  def create_relational(cls, name, related_name, m2m=False, parent_model, related_model):
    """Constructor for foreign key and many to many fields"""
    self = cls(name=name,
               field_type="m2m" if m2m else "fk",
               required=True, # relational fields are always required for now
               model=parent_model,
               related_name = related_name,
               related_model=related_model if parent_model is not related_model else 'self') # models related to self
    return self

  def identifier(self):
    """What will this field be referred to as a variable?"""
    return "m_" + self.name.replace(" ", "_")

  def django_type(self):
    return DjangoField._type_map[self.field_type]

  @property
  def is_relational(self):
    return self.field_type in [ "fk", "m2m" ]

  def args(self):
    if self.is_relational:
      return [self.name]
    else:
      return []

  def kwargs(self):
    kwargs = {}
    if self.field_type == '_CREATED':
      kwargs['auto_now_add'] = repr(True)
    elif self.field_type == '_MODIFIED':
      kwargs['auto_now'] = repr(True)
    if not self.required:
      kwargs['blank'] = repr(True)
    if self.is_relational:
      if field_type == 'm2m'
      kwargs['related_name'] = self.related_name
    return kwargs

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('model_fields.py')
    return template.render(f = self)
