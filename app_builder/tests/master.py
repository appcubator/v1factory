import simplejson as json
from app_builder.analyzer import App
from app_builder.controller import create_codes
from app_builder.coder import Coder, write_to_fs
import traceback
from shell import shell
import os.path


def main():
    try:
        module_dir = os.path.dirname(__file__)
        app_dict = open(os.path.join(module_dir, "master_state.json")).read()
        app_dict = json.loads(app_dict)
    except Exception:
        return (1, "Could not open file. Traceback: %s" % traceback.format_exc())

    try:
        app = App.create_from_dict(app_dict)
    except Exception:
        return (2, "Could not parse. Traceback: %s" % traceback.format_exc())

    try:
        codes = create_codes(app)
    except Exception:
        return (3, "Could not create app. Traceback: %s" % traceback.format_exc())

    try:
        cc = Coder.create_from_codes(codes)
        tmp_dir = write_to_fs(cc)
    except Exception:
        return (4, "Could not write code. Traceback: %s" % traceback.format_exc())

    # syncdb
    # runserver
    # run tests

    return (0, "success")



