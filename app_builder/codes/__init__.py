from jinja2 import Environment, PackageLoader, StrictUndefined

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=PackageLoader(
    'app_builder', 'code_templates'), undefined=StrictUndefined)

from models import *
from views import *
from forms import *
from urls import *
from tests import *
from imports import *
from templates import *
