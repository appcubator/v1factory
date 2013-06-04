from app_builder.coder import Coder
from app_builder.create_functions import AppComponentFactory
from pyflakes.api import check
import traceback

def create_codes(app):
    factory = AppComponentFactory()

    create_map = {'create model for entity': factory.create_model,
                  'import model into views': lambda entity: factory.import_model_into_namespace(entity, 'views'),
                  'import model into forms': lambda entity: factory.import_model_into_namespace(entity, 'forms'),
                  'import model into form receivers': lambda entity: factory.import_model_into_namespace(entity, 'form receivers'),

                  'create urls object for app': factory.create_urls,
                  'create urls object for app form receivers': factory.create_fr_urls,

                  'view for page': factory.create_view_for_page,
                  'url to serve page': factory.add_page_to_urls,

                  'find or add the needed data to the view': factory.find_or_create_query_for_view ,
                  'create row/col structure for nodes': factory.create_tree_structure_for_page_nodes,
                  'create tests for static pages': factory.create_tests_for_static_pages,

                  'create form object': factory.create_django_form_for_entity_based_form,
                  'create form receiver': factory.create_form_receiver_for_form_object,
                  'create url for form receiver': factory.create_url_for_form_receiver,


                  'import form into form receivers': factory.import_form_into_form_receivers,
    }


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

        create('import model into views', ent)
        create('import model into forms', ent)
        create('import model into form receivers', ent)

    # routes and functions to serve pages
    create('create urls object for app', app)
    create('create urls object for app form receivers', app)
    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p)


    # UIELEMENT HOOKS
    for p in app.pages:
        for uie in p.uielements:
            for hook_name in uie.hooks:
                try:
                    create(hook_name, uie)
                except Exception, e:
                    print "Failed to call hook %r on %r instance" % (hook_name, uie.__class__.__name__)
                    traceback.print_exc()


    # create html nodes and structure for pages
    for p in app.pages:
        create('create row/col structure for nodes', p)

    create('create tests for static pages', app)

    return codes

def main(app):

    codes = create_codes(app)
    cc = Coder.create_from_codes(codes)

    for rel_path, code in cc.itercode():
        print "\n\n============ %s ============\n" % rel_path, code
        #if rel_path.endswith('.py'):
        #    print check(code, 'test.py')


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
