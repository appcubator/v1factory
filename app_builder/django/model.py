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
    if name == "User":
      self = UserProfileModel(name=name, fields=fields)

    else:
      self = cls(name=name, fields=fields)

    for f in abs_model.fields:
      # only create non-relational fields here.
      if f.content_type != "list of blah" and f.name != "username":
        df = DjangoField.create(f, self)
        self.fields.add(df)

    return self

  # TODO XXX RENAME THIS FUNCTION, IT'S VERY BADLY NAMED
  def foreign_key_name(self):
    # note, i'm also using this to generate variable names for the url-data in the view
    return self.name.lower()+"_id"

  def identifier(self):
    return self.name.replace('-', '_').replace(' ', '_')

  def import_line(self):
    return "from webapp.models import " + self.identifier()

  def get_user_related_field(self):
    """linear search fields where type is foreignkey and related_model is named User or UserProfile"""
    for f in self.fields.each():
      if f.is_relational and f.related_model.name in ['User', 'UserProfile']:
        return f

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('model.py')
    return template.render(model = self)

class UserProfileModel(DjangoModel):
  def __init__(self, name=None, fields=None):
    super(UserProfileModel, self).__init__(name=name, fields=fields)
    self.fields.add(UserProfileUserField(model=self))
    uf = UsernameField(model=self)
    self.fields.add(uf)

  def identifier(self):
    return "UserProfile"

  def get_user_related_field(self):
    for f in self.fields.each():
      if isinstance(f, UserProfileUserField):
        return f

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
            'm2m' : 'ManyToManyField',
            'image' : 'TextField',
            'onetoone': 'OneToOneField',
  }

  def __init__(self, name=None, field_type=None, required=None, model=None, related_name=None, related_model=None):
    self.name = name
    self.field_type = field_type
    self.required = required
    self.model = model
    self.related_name = related_name
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

  @classmethod
  def create_relational(cls, name, related_name, parent_model, related_model, m2m=False):
    """Constructor for foreign key and many to many fields"""
    self = cls(name=name,
               field_type="m2m" if m2m else "fk",
               required=True, # relational fields are always required for now
               model=parent_model,
               related_name=related_name,
               related_model=related_model) # models related to self
    return self

  def identifier(self):
    """What will this field be referred to as a variable?"""
    return self.name.replace("-", "_").replace(" ", "_").lower() + "_field"

  def django_type(self):
    return DjangoField._type_map[self.field_type]

  @property
  def is_relational(self):
    return self.field_type in [ "fk", "m2m", "onetoone" ]

  def args(self):
    if self.is_relational:
      related_name = self.related_model.name if self is not self.related_model else '"self"'
      return [related_name]
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
      kwargs['related_name'] = repr(self.related_name)
    return kwargs

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    template = env.get_template('model_fields.py')
    return template.render(f = self)

class UsernameField(DjangoField):

  def __init__(self, *args, **kwargs):
    super(UsernameField, self).__init__(*args, **kwargs)
    self.name = "username"

  def identifier(self):
    return 'username'

  def render(self):
    return ""

class UserProfileUserField(DjangoField):
  def __init__(self, name="User", field_type='onetoone', required=None, model=None, related_name=None, related_model=None):
    super(UserProfileUserField, self).__init__(name=name, field_type=field_type, required=required, model=model, related_name=related_name, related_model=related_model)

  def args(self):
    return ["User"]

  def kwargs(self):
    return { "blank": repr(True) }

  def identifier(self):
    return "user"
