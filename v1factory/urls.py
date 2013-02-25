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
    # editor
    url(r'^app/(\d+)/editor/$', 'app_editor'),
    # urls
    url(r'^app/(\d+)/urls/$', 'app_urls'),
    # getting/setting state
    url(r'^app/(\d+)/state/$', 'app_state'),
    # deploy this ship!
    url(r'^app/(\d+)/deploy/$', 'app_deploy'),
    # the rest
    url(r'^app/(\d+)/analytics/$', 'app_analytics'),
    url(r'^app/(\d+)/design/$', 'app_design'),
    url(r'^app/(\d+)/gallery/$', 'app_gallery'),
    url(r'^app/(\d+)/data/$', 'app_data'),
    url(r'^app/(\d+)/finances/$', 'app_finances'),
    url(r'^app/(\d+)/info/$', 'app_info'),
    url(r'^app/(\d+)/pages/$', 'app_pages'),
    url(r'^app/(\d+)/account/$', 'account'),

    url(r'^app/(\d+)/tempshow/([a-zA-Z_]+)/$', 'generate_html'),
    url(r'^uielement/new/$', 'new_uielement'),
)
