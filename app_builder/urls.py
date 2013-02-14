from django.conf.urls import patterns, include, url
import views

app_urlpatterns = patterns('')

"""
app_urlpatterns = patterns('',

    url(r'^app/(\d+)/entities/$', views.entity.show_all),
    url(r'^app/(\d+)/design/$', views.app.app_design),
    url(r'^app/(\d+)/editor/$', views.app.app_editor),
    url(r'^app/(\d+)/syncschema/$', views.entity.sync_schema),
)
"""
