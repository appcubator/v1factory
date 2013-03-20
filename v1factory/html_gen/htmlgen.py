# SET UP SOME TYPES

class DomTree(object):
  def __init__(self, rows=None):
    self.rows = rows

class Row(object):
  def __init__(self, cols=None):
    self.cols = cols

class Column(object):
  def __init__(self, els=None):
    # will either be a dictionary representing uielement, or a DomTree.
    self.tree = els

# FUNCTIONS TO CREATE THOSE TYPES

def split_to_rows(uiels):
  """Given some uielements, separate them into non-overlapping rows"""
  pass # NYI

def split_to_cols(uiels):
  """Given some uielements, separate them into non-overlapping columns"""
  pass # NYI

def create_tree(uiels):
  """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
  tree = DomTree()
  tree.rows = [] # bind to the tree object

  rows = split_to_rows(uiels)
  for r in rows:
    row_obj = Row()
    row_obj.cols = []
    tree.rows.append(row_obj) # bind to the tree object

    cols = split_to_cols(r.uiels)
    for c in cols:
      col_obj = Column()
      row_obj.cols.append(col_obj) # bind to the tree object

      if len(c.els) == 1:
        col_obj.tree = None # termination of recursion
      else:
        if len(rows) == 1 and len(r.cols) == 1:
          # in this case, recursion will not terminate since input is not subdivided into smaller components
          # create a relative container and absolute position the contents.
        else:
          col_obj.tree = create_tree(c.els)

dom_tree = create_tree(uielements)
