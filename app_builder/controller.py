from app_builder.coder import Coder
from app_builder.create_functions import AppComponentFactory
from pyflakes.api import check

factory = AppComponentFactory()

create_map = {'entity': factory.create_model,
              'view for page': factory.create_view_for_page,
              'find or add the needed data to the view': factory.find_or_create_query_for_view ,
              'create row/col structure for nodes': factory.create_tree_structure_for_page_nodes }


def create_codes(app):
    codes = []

    def create(event_name, el, *args, **kwargs):
        try:
            c = create_map[event_name](el)
        except KeyError:
            print "NYI: %s" % event_name
        else:
            if c is not None:
                codes.append(c)

    # setup models
    for ent in app.entities:
        create('entity', ent)

    # routes and functions to serve pages
    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p.url)

    # adding data to the page-serve functions
    for p in app.pages:
        for uie in p.uielements:
            if uie.is_form():
                create('find or create form receiver', uie)
            elif uie.is_list():
                create('find or add the needed data to the view', uie)

    # create html nodes and structure for pages
    for p in app.pages:
        create('create row/col structure for nodes', p)

    return codes

def main(app):

    codes = create_codes(app)
    cc = Coder('/dev/null')

    for c in codes:
        cc.add_code(c)
    for rel_path, code in cc.itercode():
        print code
        if rel_path.endswith('.py'):
            print check(code, 'test.py')


"""
Sample actions include-
    render some page with some data
    redirect to another page with some data
    get noun from the DB with some query
    create, update, or delete some noun
    send an email to some user with some data

Result should be similar to an AST.
    actions=
    [
"""
