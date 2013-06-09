"""

CurrentUser.<property_of_user>+  (need to be passed in tables)             =>              some thing in the app.
Page.<name of ent>.<property_of_ent>+   (need to be passed in tables and page)       =>       some thing in the app (entity or field)

NYI: Loop.
"""

from codes.utils import FnCodeChunk

class Translator(object):
    """
    Given some tables, translates CurrentUser.<props>+ and Page.<ent>.<props>+ to their App counterpart.
    """

    def __init__(self, tables):
        self.tables = tables

    def tokenize(self, s):
        return s.split('.')

    def toks_to_django_toks_w_types(self, tokens):
        """Page.book.stores => [(None, book obj), (get_stores(), store list)] """

    def toks_to_exp(self, tokens):
        """Page.book.stores => lambda x: [(x, book obj), (get_stores(), store list)] """


    def v1script_to_app_component(self, s, django_request_handler, py=False, this_entity=None, inst_only=False):
        tokens = s.split('.')
        if tokens[0] == 'CurrentUser':
            # hard coding some shit for users
            if s == 'CurrentUser.First Name':
                return FnCodeChunk(lambda: 'user.first_name')
            if s == 'CurrentUser.Last Name':
                return FnCodeChunk(lambda: 'user.last_name')
            if s == 'CurrentUser.username':
                return FnCodeChunk(lambda: 'user.username')
            if s == 'CurrentUser.Email':
                return FnCodeChunk(lambda: 'user.email')
            ent = filter(lambda e: e.is_user, self.tables)[0]
            if py:
                assert django_request_handler is not None, "Need to get the request id on the django_request_handler"
                seed = '%s.user' % django_request_handler.locals['request']
            else:
                seed = 'user.get_profile' # this is only in template. in code, it's request.user.get_profile()
            tokens = tokens[1:]
            if len(tokens) > 0:
                seed += '.get_profile()'
        elif tokens[0] == 'Page':
            ent = self.tables[0].app.find('tables/%s' % tokens[1], name_allowed=True)
            assert django_request_handler is not None, "Plz provide a django_request_handler to the function for %r" % s
            if py:
                id_candidates = [ data['inst_id'] for arg, data in django_request_handler.args if data['inst_id'].ref == ent._django_model ]
            else:
                id_candidates = [ data['template_id'] for arg, data in django_request_handler.args if data['template_id'].ref == ent._django_model ]
            assert len(id_candidates) == 1, 'Found %d arguments in the view function with the matching djangomodel.' % len(id_candidates)
            seed = id_candidates[0]
            tokens = tokens[2:]
            # get the entity from the page which matches the type  

        elif tokens[0] == 'this': # for forms
            assert py, "this is a form in py code, so py must be true."
            seed = this_entity
            tokens = tokens[1:]
            ent = this_entity.ref
            
        else:
            raise Exception("Not Yet Implemented: %r" % s)

        output_ids = [seed]
        if inst_only:
            tokens = []

        current_ent = ent
        for tok in tokens:

            field_candidates = [ f for f in current_ent.fields if f.name == tok ]
            assert len(field_candidates) <= 1, "Found more than one field with the name: %r" % tok
            try:
                f = field_candidates[0]
                if f.is_relational():
                    current_ent = f._django_field.rel_model_id.ref._entity
                i = f._django_field.identifier
            except IndexError:
                #print "couldn't find a field with name %s. " % tok
                #print tokens
                #print current_ent.name
                # it couldn't find a field with this name, so let's try to find a related name.
                field_candidates = [ f for path, f in current_ent.app.search(r'^tables/\d+/fields/\d+$') if f.is_relational() and f.related_name == tok and f.entity == current_ent]
                assert len(field_candidates) <= 1, "Found more than one field with the related name: %r and the entity: %r" % (tok, current_ent.name)
                try:
                    f = field_candidates[0]
                    current_ent = f._django_field.model._entity
                    i = f._django_field.rel_name_id
                except IndexError:
                    raise Exception("Couldn't find field with the name or related name: %r" % tok)

            output_ids.append(i)

        return FnCodeChunk(lambda: '.'.join([str(i) for i in output_ids]))
