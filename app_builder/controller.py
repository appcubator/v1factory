from app_builder.coder import Coder
from app_builder.create_functions import AppComponentFactory
from pyflakes.api import check

def create_codes(app):
    factory = AppComponentFactory()

    create_map = {'create model for entity': factory.create_model,
                  'create urls object for app': factory.create_urls,
                  'view for page': factory.create_view_for_page,
                  'url to serve page': factory.add_page_to_urls,
                  'find or add the needed data to the view': factory.find_or_create_query_for_view ,
                  'create row/col structure for nodes': factory.create_tree_structure_for_page_nodes }


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
        create('create model for entity', ent)

    # routes and functions to serve pages
    create('create urls object for app', app)
    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p)

    # adding data to the page-serve functions
    for p in app.pages:
        for uie in p.uielements:
            # call add_to_view function of uie
            pass

    # create html nodes and structure for pages
    for p in app.pages:
        create('create row/col structure for nodes', p)

    return codes

def main(app):

    codes = create_codes(app)
    cc = Coder.create_from_codes(codes)

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
