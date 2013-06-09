from app_builder import naming


# map from internal identifier to what it actually is
IMPORTS = { 'django.models':            'from django.db import models',
            'django.models.User':       'from django.contrib.auth.models import User',

            'django.HttpResponse':      'from django.http import HttpResponse',
            'django.redirect':          'from django.shortcuts import redirect',
            'django.render':            'from django.shortcuts import render',
            'django.render_to_response':'from django.shortcuts import render_to_response',
            'django.get_object_or_404': 'from django.shortcuts import get_object_or_404',

            'django.login_required':    'from django.contrib.auth.decorators import login_required',
            'django.require_GET':       'from django.views.decorators.http import require_GET',
            'django.require_POST':      'from django.views.decorators.http import require_POST',
            'django.csrf_exempt':       'from django.views.decorators.csrf import csrf_exempt',

            'django.simplejson':        'from django.utils import simplejson',
            'django.JsonResponse':      'from webapp.utils import JsonResponse', # assumes that it's copied from code_boilerplate folder

            'django.patterns':          'from django.conf.urls import patterns',
            'django.include':           'from django.conf.urls import include',
            'django.url':               'from django.conf.urls import url',
            
            'django.test.TestCase':     'from django.test import TestCase',
            'django.test.Client':       'from django.test.client import Client',

            'django.forms':             'from django import forms',
            'django.forms.AuthForm':    'from django.contrib.auth.forms import AuthenticationForm',
            'django.forms.UserCreationForm':    'from django.contrib.auth.forms import UserCreationForm',

            'django.auth.login':        'from django.contrib.auth import login',
            'django.auth.authenticate':        'from django.contrib.auth import authenticate',
            'django.auth.logout':       'from django.contrib.auth import logout',

}


FILE_IMPORT_MAP = { 'webapp/models.py': ('django.models', 'django.models.User'),
                 'webapp/pages.py': ('django.HttpResponse',
                                    'django.login_required',
                                    'django.require_GET',
                                    'django.require_POST',
                                    'django.csrf_exempt',
                                    'django.simplejson',
                                    'django.redirect',
                                    'django.render',
                                    'django.render_to_response',
                                    'django.get_object_or_404'),
                 'webapp/form_receivers.py': ('django.HttpResponse',
                                            'django.login_required',
                                            'django.require_GET',
                                            'django.require_POST',
                                            'django.csrf_exempt',
                                            'django.simplejson',
                                            'django.JsonResponse',
                                            'django.redirect',
                                            'django.render',
                                            'django.render_to_response',
                                            'django.get_object_or_404'),
                 'webapp/forms.py': ('django.forms',),
                 'webapp/urls.py': ('django.patterns', 'django.include', 'django.url',),
                 'webapp/tests.py': ('django.test.TestCase', 'django.test.Client')
}


def create_import_namespace(file_path):
    def add_imports_to_ns(ns, import_lines):
        for i in import_lines:
            prim_name = IMPORTS[i].split('import')[1].strip()
            ns.find_or_create_import(i, prim_name) # adds to the import namespace ;)

    ns = naming.Namespace()
    add_imports_to_ns(ns, FILE_IMPORT_MAP[file_path])
    return ns
