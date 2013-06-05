"""

CurrentUser.<property_of_user>+  (need to be passed in entities)             =>              some thing in the app.
Page.<name of ent>.<property_of_ent>+   (need to be passed in entities and page)       =>       some thing in the app (entity or field)

NYI: Loop.
"""


class Translator(object):
    """
    Given some entities, translates CurrentUser.<props>+ and Page.<ent>.<props>+ to their App counterpart.
    """

    def __init__(self, entities):
        self.entities = entities

    def v1script_to_app_component(self, s, namespace, page=None):
        tokens = s.split('.')
        if tokens[0] == 'CurrentUser':
            ent = filter(lambda e: e.is_user, self.entities)
            tok_stack = reversed(tokens[1:]) # turn it into a stack. ie. Page.book.store.name => [name, store, book]
            seed = 'user' # this is if we assume we're in a template!!
        elif tokens[0] == 'Page':
            ent = self.entities.app.find('entities/%s' % tokens[1], name_allowed=True)
            assert page is not None, "Plz provide a page to the function for %r" % s
            id_candidates = [ arg for arg, data in page._django_view.args if arg.ref == ent._django_model ]
            assert len(id_candidates) == 1, 'Found %d arguments in the view function with the matching djangomodel.' 
            seed = id_candidates[0]
            # get the entity from the page which matches the type  
            
        else:
            raise Exception("Not Yet Implemented: %r" % s)

        output_str = '' + str(seed)

        current_ent = ent
        while len(tok_stack) > 0:
            tok = tok_stack.pop()

            field_candidates = [ f for f in current_ent.fields if f.name == tok ]
            assert len(field_candidates) <= 1, "Found more than one field with the name: %r" % tok
            try:
                f = field_candidates[0]
                if f.is_relational():
                    current_ent = f.rel_model_id.ref._entity
                i = f._django_field.identifier
            except IndexError:
                # it couldn't find a field with this name, so let's try to find a related name.
                field_candidates = [ f for path, f in current_ent.app.search(r'entities/\d+/fields') if f.related_name == tok and f.entity == current_ent]
                assert len(field_candidates) <= 1, "Found more than one field with the related name: %r and the entity: %r" % (tok, current_ent.name)
                try:
                    f = field_candidates[0]
                    current_ent = f.model._entity
                    i = f._django_field.rel_name_id
                except IndexError:
                    raise Exception("Couldn't find field with the name or related name: %r" % tok)

            output_str += '.%s' % i

        return output_str
