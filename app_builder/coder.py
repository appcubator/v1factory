import traceback
import os
import os.path
import autopep8
import shutil
import tempfile
import logging

from codes import BASE_IMPORTS

logger = logging.getLogger("app_builder")

from os.path import join

class Coder(object):

    def __init__(self):
        self._codes = {}

    @classmethod
    def create_from_codes(cls, codes):
        self = cls()
        for c in codes:
            self.add_code(c)
        return self

    def add_code(self, code_obj):

        try:
            self._codes[code_obj.code_path].append(code_obj)
        except KeyError:
            self._codes[code_obj.code_path] = [code_obj]

    def itercode(self):
        """Returns a generator like [(relative_path, code_string)...]"""
        for relative_path, codes in self._codes.iteritems():
            code = '\n\n'.join([ c.render() for c in codes ])

            if relative_path.endswith('.py'):
                try:
                    import_code = '\n'.join(BASE_IMPORTS[relative_path])
                    code = import_code + '\n\n' + code
                except KeyError:
                    pass

                # try to compile the code to prevent syntax errors
                # TODO Fix the modules
                try:
                    compile(code + "\n", relative_path, "exec")
                except SyntaxError:
                    traceback.print_exc()
                    continue
                else:
                    code = autopep8.fix_string(code)

            yield (relative_path, code)


""" Directory Structure """

"""
./
    requirements.txt

    __init__.py
    manage.py
    settings.py
    wsgi.py

    webapp/
        __init__.py
        urls.py
        models.py
        views.py
        emailer.py

        templates/
            base.html
            <template files>

        static/
            reset.css
            bootstrap.css
            style.css
            ajaxify.js
            jslibs/
                backbone.js
                underscore.js
                bootstrap.min.js
"""

def write_to_fs(coder, css="", dest=None):
    logger.info("Writing app to temporary directory.")

    if dest is None:
        logger.debug("Making temporary directory as destination.")
        dest = tempfile.mkdtemp()
        logger.debug("Destination: %s" % dest)

    bpsrc = os.path.join(os.path.dirname(__file__), "code_boilerplate")

    # if dir is not empty, throw an exception
    dest = os.path.normpath(dest)
    if os.listdir(dest):
        raise Exception("I'm not going to write into a nonempty directory, that's dangerous")

    # create directories
    logger.debug("Creating internal directories.")
    if not os.path.exists(dest):
        os.makedirs(dest)
    os.mkdir(join(dest, "webapp"))
    os.mkdir(join(dest, "webapp", "templates"))
    os.mkdir(join(dest, "webapp", "static"))
    #os.mkdir(join(dest, "webapp", "static", "jslibs"))

    def f_transporter(src_str, dest_str, f, *args, **kwargs):
        src_tokens = src_str.split('/')
        dest_tokens = dest_str.split('/')
        return f(join(bpsrc, *src_tokens), join(dest, *dest_tokens), *args, **kwargs)

    def write_string(content, dest_str):
        dest_tokens = dest_str.split('/')
        f = open(join(dest, *dest_tokens), "wb")
        f.write(content.encode("utf-8"))
        f.close()

    def copy_file(src_str, dest_str):
        return f_transporter(src_str, dest_str, shutil.copyfile)

    # copy boilerplate
    logger.debug("Copying boilerplate files.")
    for fname in ['.gitignore', 'requirements.txt', '__init__.py', 'manage.py',
                  'settings.py', 'wsgi.py']:
        copy_file(fname, fname)
    copy_file('base.html', 'webapp/templates/base.html')

    # main webapp files
    logger.debug("Rendering and writing webapp files.")
    copy_file('__init__.py', 'webapp/__init__.py')
    for rel_path, code in coder.itercode():
        write_string(code, rel_path)


    # static
    logger.debug("Copying static files, and writing CSS.")
    f_transporter('jslibs', 'webapp/static/jslibs', shutil.copytree)
    f_transporter('img', 'webapp/static/img', shutil.copytree)
    copy_file('ajaxify.js', 'webapp/static/ajaxify.js')
    copy_file('css/bootstrap.css', 'webapp/static/bootstrap.css')
    copy_file('css/reset.css', 'webapp/static/reset.css')
    write_string(css, 'webapp/static/style.css') # TODO write css

    logger.info("Finished writing django app.")

    return dest
