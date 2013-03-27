import re

from jinja2 import Environment, PackageLoader

from app_builder.analyzer import Container, Node, Page, QuerysetWrapper, Renderable

class Column(Renderable):
  def __init__(self):
    # will either be a dictionary representing uielement, or a DomTree.
    self.uiels = []
    self.margin_left = 0
    self.width = 0
    self.tree = None # uninitialized state

class Row(Renderable):
  def __init__(self):
    self.uiels = []
    margin_top = 0
    self.cols = None # uninitialized state

class DomTree(Renderable):
  def __init__(self):
    self.rows = []

class DjangoTemplate(Renderable):
  def __init__(self, name=None, filename=None, page=None):
    self.name = name
    self.filename = filename
    self.page = page

  @classmethod
  def create(cls, page):
    name = page.name.replace(" ", "_")
    self = cls(name=page.name, filename=name+".html", page=page)

    self.dom_tree = self.create_tree(page.uielements)

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

  def create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
    """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
    tree = DomTree()

    tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
    for r in tree.rows:
      r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
      for c in r.cols:
        if len(c.uiels) == 1:
          c.tree = None # termination of recursion
        else:
          if len(tree.rows) == 1 and len(r.cols) == 1:
            # in this case, recursion will not terminate since input is not subdivided into smaller components
            # create a relative container and absolute position the contents.
            c.tree = None
          else:
            c.tree = self.create_tree(c.uiels, top_offset=r.uiels[0].uie['layout']['top'], left_offset=c.uiels[0].uie['layout']['left'])
    return tree

  def split_to_cols(self, uiels, left_offset=0):
    """Given some uielements, separate them into non-overlapping columns"""
    cols = []
    if len(uiels) == 0:
      return cols

    sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['left'])
    #pdb.set_trace()

    # leftmost uiel must be in the row
    current_col = Column()
    cols.append(current_col)
    current_block = sorted_uiels.pop(0)
    current_col.uiels.append(current_block)
    current_col.margin_left = current_block.uie['layout']['left'] - left_offset

    # iterate over the uiels left down
    for u in sorted_uiels:
      current_right = current_block.uie['layout']['left'] + current_block.uie['layout']['width']
      u_left = u.uie['layout']['left']
      u_right = u_left + u.uie['layout']['width']

      #Two cases:
      #1. this block is in the current row.
      if u_left < current_right:
        current_col.uiels.append(u)
          #a. this block is extends longer than the current block
        if u_right > current_right:
          current_block = u
      #2. this block must be the left-most block in a new row
      else:
        current_col.width = current_right - current_col.uiels[0].uie['layout']['left']

        current_col = Column()
        cols.append(current_col)

        current_col.uiels.append(u)
        current_col.margin_left = u_left - current_right

        current_block = u

    # set the width of the last column
    current_right = current_block.uie['layout']['left'] + current_block.uie['layout']['width']
    current_col.width = current_right - current_col.uiels[0].uie['layout']['left']

    return cols

  def split_to_rows(self, uiels, top_offset=0):
    """Given some uielements, separate them into non-overlapping rows"""
    # do a top down sweep, to identify continuous areas of emptiness
    # start with an empty row, and include the top-most block
    # then see if there are other blocks which lie on top of this.bottom_boundary.
    # if there are, add it to this row. start with that block and try again
    # if not, then end the row. create a new row and repeat if there are more blocks to place.

    rows = []
    if len(uiels) == 0:
      return rows

    sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['top'])

    # topmost uiel must be in the row
    current_row = Row()
    rows.append(current_row)
    current_block = sorted_uiels.pop(0)
    current_row.uiels.append(current_block)
    current_row.margin_top = current_block.uie['layout']['top'] - top_offset

    # iterate over the uiels top down
    for u in sorted_uiels:
      current_bottom = current_block.uie['layout']['top'] + current_block.uie['layout']['height']
      u_top = u.uie['layout']['top']
      u_bottom = u_top + u.uie['layout']['height']

      #Two cases:
      #1. this block is in the current row.
      if u_top < current_bottom:
        current_row.uiels.append(u)
          #a. this block is extends longer than the current block
        if u_bottom > current_bottom:
          current_block = u
      #2. this block must be the top-most block in a new row
      else:
        current_row = Row()
        rows.append(current_row)

        current_row.uiels.append(u)
        current_row.margin_top = u_top - current_bottom

        current_block = u

    return rows
