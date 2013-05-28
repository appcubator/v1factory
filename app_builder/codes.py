from jinja2 import Environment, PackageLoader
from app_builder import naming

env = Environment(trim_blocks=True, loader=PackageLoader(
    'app_builder', 'code_templates'))


class HTMLContainer(object):
    pass


class DjangoPageView(object):

    def __init__(self, identifier, page_context={}):
        self.identifier = identifier
        self.code_path = "webapp/pages.py"
        self.page_context = page_context

        # action is some kind of tree where the terminal nodes render
        # HTTPResponses.
        self.actions = None

    def render(self):
        return env.get_template('view.py').render(view=self)


class DjangoField(object):

    _type_map = {'text': 'TextField',
                 'number': 'FloatField',
                 'date': 'DateTimeField',
                 '_CREATED': 'DateTimeField',
                 '_MODIFIED': 'DateTimeField',
                 'email': 'EmailField',
                 'fk': 'ForeignKey',
                 'm2m': 'ManyToManyField',
                 'image': 'TextField',
                 'onetoone': 'OneToOneField',
                 }

    def __init__(self, identifier, canonical_type, required=False, parent_model=None):
        """parent_model is a DjangoModel instance"""
        self.identifier = identifier
        self.canon_type = canonical_type
        self.django_type = self.__class__._type_map[canonical_type]
        self.required = required
        self.model = parent_model
        self.args = []

    def kwargs(field):
        kwargs = {}
        if field.canon_type == '_CREATED':
            kwargs['auto_now_add'] = repr(True)
        elif field.canon_type == '_MODIFIED':
            kwargs['auto_now'] = repr(True)
        if field.required:
            if field.canon_type in ['text', 'email', 'image']:
                kwargs['default'] = repr("")
            if field.canon_type in ['float', 'date']:
                kwargs['default'] = repr(0)
        if not field.required:
            kwargs['blank'] = repr(True)
        return kwargs


class DjangoModel(object):

    def __init__(self, identifier):
        self.identifier = identifier
        self.code_path = "webapp/models.py"
        self.field_namer = naming.USNamespace()
        self.fields = []

    def create_field(self, name, canonical_type, required):
        identifier = self.field_namer.new_identifier(name)
        f = DjangoField(
            identifier, canonical_type, required=required, parent_model=self)
        self.fields.append(f)
        return f

    def render(self):
        return env.get_template('model.py').render(model=self)


class Code(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el
        self.code_path = "webapp/something"

    def render(self):
        return "%s for %d" % (self.name, id(self.el))





class Column(object):
    def __init__(self):
        # will either be a dictionary representing uielement, or a DomTree.
        self.uiels = []
        self.margin_left = 0
        self.width = 0
        self.tree = None
        self.has_overlapping_nodes = False


class Row(object):
    def __init__(self):
        self.uiels = []
        self.margin_top = 0
        self.cols = None

class DomTree(object):
    def __init__(self):
        self.rows = []

class DjangoTemplate(object):
    def __init__(self, identifier, filename):
        self.identifier = identfier
        self.filename = filename

    def split_to_cols(self, uiels, left_offset=0):
        """Given some uielements, separate them into non-overlapping columns"""
        cols = []
        if len(uiels) == 0:
            return cols

        sorted_uiels = sorted(uiels, key=lambda u: u.uie['layout']['left'])

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

    def create_tree(self, uiels):
        self.dom_tree = self._create_tree(uiels)

    def _create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
        """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement"""
        tree = DomTree()

        tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
        for i, r in enumerate(tree.rows):
            r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
            for c in r.cols:
                if len(c.uiels) == 1:
                    c.tree = None # termination of recursion
                else:
                    inner_top_offset=r.uiels[0].uie['layout']['top']
                    inner_left_offset=c.uiels[0].uie['layout']['left']
                    if len(tree.rows) == 1 and len(r.cols) == 1:
                        # in this case, recursion will not terminate since input is not subdivided into smaller components
                        # create a relative container and absolute position the contents.

                        min_top = c.uiels[0].top
                        max_bottom = c.uiels[0].top + c.uiels[0].height
                        for uie in c.uiels:
                            uie.top_offset = uie.top - inner_top_offset
                            uie.left_offset = uie.left - inner_left_offset
                            uie.overlap_styles = "position: absolute; top: %spx; left: %spx;" % (15* uie.top_offset, 80* uie.left_offset)
                            min_top = min(uie.top, min_top)
                            max_bottom = max(uie.top + uie.height, max_bottom)


                        c.has_overlapping_nodes = True

                        c.container_height = max_bottom - min_top

                        c.tree = None
                    else:
                        c.tree = self._create_tree(c.uiels, top_offset=inner_top_offset, left_offset=inner_left_offset, recursive_num = recursive_num + 1)
        return tree

