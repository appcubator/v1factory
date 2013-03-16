from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),
    url(r'^webapp_login_receiver/$', 'django.contrib.auth.views.login'),

    {% for v in urls %}
    url({{ v.url_repr() }}, {{ v.view_path_repr() }}),
    {% endfor %}
)

urlpatterns += staticfiles_urlpatterns()
