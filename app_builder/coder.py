import os
import os.path
import autopep8


class Coder(object):

    def __init__(self, app_dir):
        self.app_dir = app_dir
        self._codes = {}

    def add_code(self, code_obj):

        try:
            self._codes[code_obj.code_path].append(code_obj)
        except KeyError:
            self._codes[code_obj.code_path] = [code_obj]

    def itercode(self):
        for relative_path, codes in self._codes.iteritems():
            code = '\n\n'.join([ c.render() for c in codes ])

            if relative_path.endswith('.py'):
                # try to compile the code to prevent syntax errors
                compile(code + "\n", relative_path, "exec")
                # fix style
                code = autopep8.fix_string(code)

            yield (relative_path, code)


    def code(self):
        for relative_path, code in self.itercode():
            target_file_path = os.path.join(self.app_dir, relative_path)
            os.makedirs(target_file_path)
            f = open(target_file_path, "w")
            f.write(code)
            f.close()
            self._codes[relative_path] = ""


