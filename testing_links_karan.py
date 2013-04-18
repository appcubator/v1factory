# -*- coding: utf-8 -*-
import simplejson
from app_builder.analyzer import AnalyzedApp
from app_builder.django.coordinator import analyzed_app_to_app_components
from app_builder.django.writer import DjangoAppWriter

test_f = open('app_builder/testing_jsons/mywitter.json')
test_state = simplejson.load(test_f)

# analyzer
a = AnalyzedApp(test_state)

# coordinator
dw = analyzed_app_to_app_components(a, simplejson.dumps({"user_name":"ksikka", "date_joined":"trollface"}))

# writer
tmp_project_dir = DjangoAppWriter(dw, "").write_to_fs()
print tmp_project_dir
