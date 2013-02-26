import re

class UIElement:

  context_regex = re.compile(r'<%= (.+) %>')

  def __init__(self, lib_id):
    self.lib_el = UIElement.get_library().get(pk=lib_id)

  def __init__(self, lib_el):
    self.lib_el = lib_el

  def get_required_context(self):
    context_names = re.findall(context_regex, self.lib_el.html)
    return context_names

