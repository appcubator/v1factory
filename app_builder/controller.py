from app_builder.coder import Coder
from app_builder.create_functions import AppComponentFactory
from pyflakes.api import check

factory = AppComponentFactory()

create_map = {'entity': factory.create_model,
               'view for page': factory.create_view_for_page }


def create_codes(app):
    codes = []

    def create(event_name, el, *args, **kwargs):
        try:
            c = create_map[event_name](el)
        except KeyError:
            print "NYI: %s" % event_name
        else:
            codes.append(c)

    for ent in app.entities:
        create('entity', ent)

    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p.url)
        for uie in p.uielements:
            if uie.is_form():
                create('html form for uie', uie)
                create('find or create form receiver', uie)
            elif uie.is_list():
                create('find or add the needed data to the view', uie)
                create('html for-loop for list', uie)
            elif uie.is_node():
                create('html node', uie)
            else:
                assert False

    return codes

def main(app):

    codes = create_codes(app)
    cc = Coder('/dev/null')

    for c in codes:
        cc.add_code(c)
    for rel_path, code in cc.itercode():
        print code
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
