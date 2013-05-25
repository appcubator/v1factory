from app_builder.coder import Coder
from app_builder.codes import Code, DjangoModel


def main(app):
    codes = []
    def create(event_name, el, *args, **kwargs):
        create_map = { 'model': DjangoModel.create_for_entity }
        try:
            c = create_map[event_name](el)
        except KeyError:
            c = Code(event_name, el)
        codes.append(c)


    for ent in app.entities:
        create('model', ent)
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

    # now we have teh codes
    # we can have a coder write them

    cc = Coder('/dev/null')

    for c in codes:
        cc.add_code(c)
    for rel_path, code in cc.itercode():
        if rel_path == 'webapp/models.py':
            from pyflakes.api import check
            print code
            print check(code, 'models.py')






# brainstorming

## you can think of generating bytecode which looks like CREATE CODE ID=132234 WITH identifier=WHATERVER etc...

# code really should be an object.
# people can make their own code classes?
# ok, so code classes should stand on their own, be fully testable, etc.
# i can start with models


# code itself is a tree
# so we are transforming the app tree into this tree...
# for each page
    # conditional loading
    # how would i add that feature?
        # add some data to the analyzer
        # edit the extremely flexible code template.
        # how does the program know what code to write?
        # there must be a programming language which describes how to write code...
        # code templates are limited in their sophistication, and they quickly get messy.
        # use a function to create data, then render the data in the template-
        # use the template only as a presentation layer
