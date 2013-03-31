class DjangoFormReceiver(object):
  """For now it only handles create forms"""
  def __init__(self, name=None, included_fields=None, model=None):
    self.name = name
    self.included_fields = included_fields
    self.model = model
    self.form_fields = []

  def init_fields(self):
    for f in self.included_fields:
      self.form_fields.append(DjangoFormField.create(f, self))
    pass

  @classmethod
  def create(cls, form, analyzed_app):
    name = form.name
    model = analyzed_app.models.get_by_name(form.entity.name)
    included_fields = form.included_fields
    self = cls(name=name, included_fields=included_fields, model=model)

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  @classmethod
  def create_signup(cls, form, analyzed_app):
    name = form.name
    self = cls(name=name, included_fields=form.included_fields, model=analyzed_app.models.get_by_name('User'))

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  @classmethod
  def create_login(cls, form, analyzed_app):
    name = form.name
    included_fields = ['username', 'password', 'email']
    self = cls(name=name, included_fields=form.included_fields, model=analyzed_app.models.get_by_name('User'))

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  def find_model(self, models):
    """Gets the Django Model"""
    """maps to model fields"""
    self.model = models.get_by_name(self.model.name)
    new_included_fields = []
    for f in self.included_fields:
      if f.is_model_field():
        new_included_fields.append(self.model.fields.get_by_name(f.model_field.name))
    self.included_fields = new_included_fields

  def identifier(self):
    def sanitize_name(s):
      return s.replace(" ", "_")
    return "receive_{}".format(sanitize_name(self.form.name))

  def view_path(self):
    return "webapp.form_receivers."+self.identifier()

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    if self.model.name != 'User':
      template = env.get_template('form_receiver.py')
      return template.render(form_receiver=self)
    else:
      template = env.get_template('signup_form_receiver.py')
      return template.render(form_receiver=self)


class SignupFormReceiver(DjangoFormReceiver):

  @property
  def userprofile_fields(self):
    return [ f for f in self.included_fields if f.name != 'username' ]

class LoginFormReceiver(DjangoFormReceiver):

  def view_path(self):
    return "django.contrib.auth.views.login"

  def render(self):
    return ""
