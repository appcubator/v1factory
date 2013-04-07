# THESE ARE THE PRODUCTION SETTINGS FOR THE APP RUNNING IN EC2


from settings.common import *

DEBUG = False
TEMPLATE_DEBUG = DEBUG
PRODUCTION = True
STAGING = False

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

import os.path
PROJECT_ROOT_PATH = os.path.join(os.path.dirname(__file__), "..")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': os.path.join(PROJECT_ROOT_PATH, 'tempdb'),
    },
   #'default': {
   #    'ENGINE': 'django.db.backends.mysql',
   #    'NAME': 'westdb',
   #    'USER': 'master',
   #    'PASSWORD': 'imadatabase',
   #    'HOST': 'prodv1factory.cbdwcbfkvkrq.us-west-1.rds.amazonaws.com',
   #    'PORT': 3306
   #}
}
