import re
import keyword

built_in_functions = ('abs', 'divmod', 'input', 'open', 'staticmethod',
                    'all', 'enumerate', 'int', 'ord', 'str',
                    'any', 'eval', 'isinstance', 'pow', 'sum',
                    'basestring', 'execfile', 'issubclass', 'print', 'super',
                    'bin', 'file', 'iter', 'property', 'tuple',
                    'bool', 'filter', 'len', 'range', 'type',
                    'bytearray', 'float', 'list', 'raw_input', 'unichr',
                    'callable', 'format', 'locals', 'reduce', 'unicode',
                    'chr', 'frozenset', 'long', 'reload', 'vars',
                    'classmethod', 'getattr', 'map', 'repr', 'xrange',
                    'cmp', 'globals', 'max', 'reversed', 'zip',
                    'compile', 'hasattr', 'memoryview', 'round', '__import__',
                    'complex', 'hash', 'min', 'set', 'apply',
                    'delattr', 'help', 'next', 'setattr', 'buffer',
                    'dict', 'hex', 'object', 'slice', 'coerce',
                    'dir', 'id', 'oct', 'sorted', 'intern')

django_keywords = ('',)

def cw2us(x): # capwords to underscore notation
    return re.sub(r'(?<=[a-z])[A-Z]|(?<!^)[A-Z](?=[a-z])',
        r"_\g<0>", x).lower(  )


def us2cw(x): # underscore to capwords notation
    s = us2mc(x)
    return s[0].upper(  )+s[1:]

def make_safe(s):
    s = re.sub(r'[^a-zA-Z0-9_]', '', s)
    s = re.sub(r'^[^a-zA-Z]+', '', s)
    if len(s) == 0:
        print "this is bad"
        return 'unnamed'
    if not re.search(r'^[a-zA-Z]', s):
        s = {1: 'one', 2: 'two', 3: 'three',
             4: 'four', 5: 'five', 6: 'six',
             7: 'seven', 8: 'eight', 9: 'nine',
             0: 'zero'}[s[0]] + s[1:]
    if s in built_in_functions or keyword.iskeyword(s):
        s += '_val'
    return s

class FieldNamer(object):

    def __init__(self, *args, **kwargs):
        self.used_ids = []
        self.id_field_map = {}

    def get_identifier(self, field):
        candidate = make_safe(field.name.replace(' ', '_').lower())
        while candidate in self.used_ids:
            if re.search(r'[2-9]$', candidate):
                candidate = candidate[:-1] + str(int(candidate[-1]) + 1)
            else:
                candidate += '2'
        self.used_ids.append(candidate)
        return candidate

