import re

from jinja2 import Environment, PackageLoader
from app_builder.analyzer import Container, Node, Page, QuerysetWrapper

class DjangoTemplate(object):
  env = Environment(loader=PackageLoader('app_builder.django', 'code_templates/template_templates'))

  def __init__(self, name=None, filename=None, page=None):
    self.name = name
    self.filename = filename
    self.page = page

  @classmethod
  def create(cls, page):
    name = page.name.replace(" ", "_")
    self = cls(name=page.name, filename=name+".html", page=page)

    # resolve links, doesn't yet support dynamic links.
    for uie in self.page.uielements:
      if isinstance(uie, Container):
        for n in uie.nodes:
          if 'href' in n.attribs:
            if isinstance(n.attribs['href'], Page):
              n.attribs['href'] = n.attribs['href'].route.static_url()
      else:
        if 'href' in uie.attribs:
          if isinstance(uie.attribs['href'], Page):
            uie.attribs['href'] = uie.attribs['href'].route.static_url()

    return self

  def properly_name_vars_in_q_container(self, models):
    """Replaces the model handlebars with the template text require to render the for loop properly"""
    query_containers = filter(lambda x: isinstance(x, QuerysetWrapper), self.page.uielements)
    plain_old_nodes = filter(lambda x: isinstance(x, Node), self.page.uielements)

    def fix_the_string(s, single=False):
      handlebars_search = re.findall(r'\{\{ ?([A-Za-z0-9]+)_(\w+) ?\}\}', s)
      # check validity
      for mname, fname in handlebars_search:
        m = models.get_by_name(mname)
        assert(m is not None) # if err, then mname is not a model
        f = m.fields.get_by_name(fname)
        assert(f is not None) # if err, then fname is not a field of the model
      # function to do the replacing
      def repl_handlebars(match):
        m = models.get_by_name(match.group(1))
        f = m.fields.get_by_name(match.group(2))
        if single:
          return "{{ "+m.identifier().lower()+"."+f.identifier()+" }}"
        else:
          return "{{ item."+f.identifier()+" }}"
      # replace the content.
      return re.sub(r'\{\{ ?([A-Za-z0-9]+)_(\w+) ?\}\}', repl_handlebars, s)

    for uie in query_containers:
      for n in uie.nodes:
        n.set_content(fix_the_string(n.content(), single=False))
    for n in plain_old_nodes:
      n.set_content(fix_the_string(n.content(), single=True))


  def render(self):
    template = DjangoTemplate.env.get_template('template.html')
    return template.render(uielements=self.page.uielements, css_props=self.page.design_props)
