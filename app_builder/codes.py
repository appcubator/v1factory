from jinja2 import Environment, PackageLoader, StrictUndefined
from app_builder import naming

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=PackageLoader(
    'app_builder', 'code_templates'), undefined=StrictUndefined)


class DjangoQuery(object):

    def __init__(self, model_id):
        self.model_id = model_id

    def render(self):
        return "%s.objects.all()" % self.model_id

class DjangoPageView(object):

    def __init__(self, identifier, args=None, template_code_path="", queries=None):
        """
        args is a list of tuples: (identifier, some_data_as_dict)
        """
        self.identifier = identifier
        self.code_path = "webapp/pages.py"

        # args, make a namespace for the function
        self.namespace = naming.USNamespace()
        self.namespace.new_identifier('request')
        if args is None:
            args = []
        self.args = [ (self.namespace.new_identifier(arg), data) for arg, data in args ]

        # continuing args, make a namespace for page context
        self.pc_namespace = naming.USNamespace()
        for arg, data in self.args:
            name_attempt = data.get('template_id', 'BADNAME') # helps a test pass
            data['template_id'] = self.pc_namespace.new_identifier(name_attempt)

        # queries
        if queries is None:
            queries = []
        self.queries = queries

        self.template_code_path = template_code_path

    def add_query(self, dq_obj):
        template_id = self.pc_namespace.new_identifier(dq_obj.model_id + 's') # very crude pluralize
        self.queries.append((template_id, dq_obj.render()))

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


class Column(object):

    def __init__(self):
        self.uiels = []
        self.margin_left = 0
        self.width = 0
        self.tree = None
        self.has_overlapping_nodes = False

    @property
    def classes(self):
        classes = ['span%d' % self.width]
        if self.margin_left > 0:
            classes.append('offset%d' % self.margin_left)
        if self.has_overlapping_nodes:
            classes.append('hi%d' % self.container_height)
        return classes

    @property
    def class_string(self):
        return ' '.join(self.classes)

    @property
    def styles(self):
        styles = []
        if self.has_overlapping_nodes:
            styles.append('position:relative')
        return styles

    @property
    def style_string(self):
        return '; '.join(self.styles)


class Row(object):

    def __init__(self):
        self.uiels = []
        self.margin_top = 0
        self.cols = None

    @property
    def classes(self):
        classes = ['row']
        if self.margin_top > 0:
            classes.append('hoff%d' % self.margin_top)
        return classes

    @property
    def class_string(self):
        return ' '.join(self.classes)


class DomTree(object):

    def __init__(self):
        self.rows = []


class DjangoTemplate(object):

    def __init__(self, identifier):
        self.identifier = identifier
        self.filename = identifier + '.html'
        self.code_path = "webapp/templates/" + self.filename

    def split_to_cols(self, uiels, left_offset=0):
        """Given some uielements, separate them into non-overlapping columns"""
        cols = []
        if len(uiels) == 0:
            return cols

        sorted_uiels = sorted(uiels, key=lambda u: u.layout.left)

        # leftmost uiel must be in the row
        current_col = Column()
        cols.append(current_col)
        current_block = sorted_uiels.pop(0)
        current_col.uiels.append(current_block)
        current_col.margin_left = current_block.layout.left - left_offset

        # iterate over the uiels left down
        for u in sorted_uiels:
            current_right = current_block.layout.left + \
                current_block.layout.width
            u_left = u.layout.left
            u_right = u_left + u.layout.width

            # Two cases:
            # 1. this block is in the current row.
            if u_left < current_right:
                current_col.uiels.append(u)
                    # a. this block is extends longer than the current block
                if u_right > current_right:
                    current_block = u
            # 2. this block must be the left-most block in a new row
            else:
                current_col.width = current_right - \
                    current_col.uiels[0].layout.left

                current_col = Column()
                cols.append(current_col)

                current_col.uiels.append(u)
                current_col.margin_left = u_left - current_right

                current_block = u

        # set the width of the last column
        current_right = current_block.layout.left + current_block.layout.width
        current_col.width = current_right - current_col.uiels[0].layout.left

        return cols

    def split_to_rows(self, uiels, top_offset=0):
        """Given some uielements, separate them into non-overlapping rows"""
        # do a top down sweep, to identify continuous areas of emptiness
        # start with an empty row, and include the top-most block
        # then see if there are other blocks which lie on top of this.bottom_boundary.
        # if there are, add it to this row. start with that block and try again
        # if not, then end the row. create a new row and repeat if there are
        # more blocks to place.

        rows = []
        if len(uiels) == 0:
            return rows

        sorted_uiels = sorted(uiels, key=lambda u: u.layout.top)

        # topmost uiel must be in the row
        current_row = Row()
        rows.append(current_row)
        current_block = sorted_uiels.pop(0)
        current_row.uiels.append(current_block)
        current_row.margin_top = current_block.layout.top - top_offset

        # iterate over the uiels top down
        for u in sorted_uiels:
            current_bottom = current_block.layout.top + \
                current_block.layout.height
            u_top = u.layout.top
            u_bottom = u_top + u.layout.height

            # Two cases:
            # 1. this block is in the current row.
            if u_top < current_bottom:
                current_row.uiels.append(u)
                    # a. this block is extends longer than the current block
                if u_bottom > current_bottom:
                    current_block = u
            # 2. this block must be the top-most block in a new row
            else:
                current_row = Row()
                rows.append(current_row)

                current_row.uiels.append(u)
                current_row.margin_top = u_top - current_bottom

                current_block = u

        return rows

    def create_tree(self, uiels):
        self.tree = self._create_tree(uiels)

    def _create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
        """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement.
           It also detects the situation where splitting into row/column cannot be acheived.
           For that, it makes the column position:relative, and the inner uiels position absolute.
           In this case, it also sets an attribute on uie called "overlap_styles"."""
        tree = DomTree()

        tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
        for i, r in enumerate(tree.rows):
            r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
            for c in r.cols:
                if len(c.uiels) == 1:
                    c.tree = None  # termination of recursion
                else:
                    inner_top_offset = r.uiels[0].layout.top
                    inner_left_offset = c.uiels[0].layout.left
                    if len(tree.rows) == 1 and len(r.cols) == 1:
                        # in this case, recursion will not terminate since input is not subdivided into smaller components
                        # create a relative container and absolute position the
                        # contents.

                        min_top = c.uiels[0].layout.top
                        max_bottom = c.uiels[0].layout.top + c.uiels[0].layout.height
                        for uie in c.uiels:
                            top_offset = uie.layout.top - inner_top_offset
                            left_offset = uie.layout.left - inner_left_offset
                            uie.overlap_styles = "position: absolute; top: %spx; left: %spx;" % (
                                15 * top_offset, 80 * left_offset)
                            min_top = min(uie.layout.top, min_top)
                            max_bottom = max(uie.layout.top + uie.layout.height, max_bottom)

                        c.has_overlapping_nodes = True

                        c.container_height = max_bottom - min_top

                        c.tree = None
                    else:
                        c.tree = self._create_tree(
                            c.uiels, top_offset=inner_top_offset, left_offset=inner_left_offset, recursive_num=recursive_num + 1)
        return tree

    def render(self):
        return env.get_template('htmlgen/djangotemplate.html').render(template=self)


class DjangoURLs(object):
    """
    Represents a set of URL - function mappings.
    """

    def __init__(self, module_string):
        self.module = module_string
        self.routes = []
        self.imports = ['from django.conf.urls import patterns, include, url']
        self.code_path = "webapp/urls.py"

    def render(self):
        return env.get_template('urls.py').render(urls=self)

class DjangoStaticPagesTestCase(object):
    def __init__(self, identifier_url_pairs):
        self.imports = ['from django.test import TestCase']
        self.identifier_url_pairs = identifier_url_pairs
        self.code_path = "webapp/tests.py"

    def render(self):
        return env.get_template('tests.py').render(test=self)

class DjangoStaticPagesTestCase(object):
    def __init__(self, identifier_url_pairs):
        self.imports = ['from django.test import TestCase']
        self.identifier_url_pairs = identifier_url_pairs
        self.code_path = "webapp/tests.py"

    def render(self):
        return env.get_template('tests/static_pages.py').render(test=self)
