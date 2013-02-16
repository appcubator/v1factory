from django.conf.urls import patterns, include, url
import django.contrib.auth.views
import app_builder.urls
import v1factory.base_views, v1factory.views

# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$', 'django.contrib.auth.views.login', { 'template_name' : 'home.html' }),
    url(r'^login/$', 'django.contrib.auth.views.login'),
    url(r'^logout/$', 'django.contrib.auth.views.logout'),
    url(r'^connect_with/$', 'v1factory.base_views.get_linkedin'),
)

urlpatterns += patterns('v1factory.views',
    url(r'^app/$', 'app_list'),
    url(r'^app/new/$', 'app_new'),
    url(r'^app/(\d+)/$', 'app_page'),
    # entities
    url(r'^app/(\d+)/entities/$', 'entities'),
    url(r'^app/(\d+)/syncschema/$', 'sync_schema'),
    # editor
    url(r'^app/(\d+)/page/([a-zA-Z_]+)/$', 'app_template'),
    # the rest
    url(r'^app/(\d+)/analytics/$', 'app_analytics'),
    url(r'^app/(\d+)/design/$', 'app_design'),
    url(r'^app/(\d+)/editor/$', 'app_editor'),
    url(r'^app/(\d+)/data/$', 'app_data'),
    url(r'^app/(\d+)/finances/$', 'app_finances'),
    url(r'^app/(\d+)/account/$', 'account'),
)

urlpatterns += patterns('v1factory.dev_views',
    url(r'^dev/app/$', 'app_list'),
    url(r'^dev/app/new/$', 'app_new'),
    url(r'^dev/app/(\d+)/$', 'app_page'),
    # entities
    url(r'^dev/app/(\d+)/entities/$', 'entities'),
    url(r'^dev/app/(\d+)/syncschema/$', 'sync_schema'),
    # editor
    url(r'^dev/app/(\d+)/page/([a-zA-Z_]+)/$', 'app_template'),
    # the rest
    url(r'^dev/app/(\d+)/analytics/$', 'app_analytics'),
    url(r'^dev/app/(\d+)/design/$', 'app_design'),
    url(r'^dev/app/(\d+)/editor/$', 'app_editor'),
    url(r'^dev/app/(\d+)/data/$', 'app_data'),
    url(r'^dev/app/(\d+)/finances/$', 'app_finances'),
    url(r'^dev/app/(\d+)/account/$', 'account'),
)