class DjangoFormReceiver(object):
  """For now it only handles create forms"""
  def __init__(self, name=None, included_fields=None, model=None):
    self.name = name
    self.included_fields = included_fields
    self.model = model

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
    included_fields = ['username', 'password', 'email']
    self = cls(name=name, included_fields=included_fields, model=analyzed_app.models.get_by_name('User'))

    self.form = form
    self.form.form_receiver = self
    self.page = form.page

    return self

  def find_model(self, models):
    self.model = models.get_by_name(self.model.name)
    new_included_fields = []
    for i, f in enumerate(self.included_fields):
      new_included_fields.append(self.model.fields.get_by_name(f['real_field'].name))
    self.included_fields = new_included_fields

  def identifier(self):
    return "receive_{}".format(self.form.name)

  def view_path(self):
    return "webapp.form_receivers."+self.identifier()

  def render(self):
    from jinja2 import Environment, PackageLoader
    env = Environment(loader=PackageLoader('app_builder.django', 'code_templates'))
    if self.model is not None:
      template = env.get_template('form_receiver.py')
      return template.render(form_receiver=self, model=self.model)
    else:
      template = env.get_template('signup_form_receiver.py')
      return template.render(form_receiver=self)
