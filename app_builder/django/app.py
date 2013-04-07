class DjangoApp(object):
  """Wrap all the app components. Nuff said"""

  def __init__(self, d_models, d_views, d_urls, d_templates, d_form_receivers, user_creator):
    self.models = d_models
    self.views = d_views
    self.urls = d_urls
    self.templates = d_templates
    self.form_receivers = d_form_receivers
    self.user_creator = user_creator
