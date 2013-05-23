# traverse the tree and for each thing, call the code create function, which will return a Code object

codes = []

class Code(object):

    def __init__(self, name, el):
        self.name = name
        self.el = el

    def render(self):
        return "%s for %d" % (self.name, id(self.el))


class DjangoModel(Code):

    @classmethod
    def create_for_entity(cls, entity):
        self = cls("model for %s" % entity.name, entity)
        return self


def create(event_name, el, *args, **kwargs):
    create_map = { 'model': DjangoModel.create_for_entity }
    try:
        c = create_map[event_name](el)
    except KeyError:
        c = Code(event_name, el)
    codes.append(c)




def main(app):
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

    for c in codes:
        print c.render()






# brainstorming

## you can think of generating bytecode which looks like CREATE CODE ID=132234 WITH identifier=WHATERVER etc...

# code really should be an object.
# people can make their own code classes?
# ok, so code classes should stand on their own, be fully testable, etc.
# i can start with models

