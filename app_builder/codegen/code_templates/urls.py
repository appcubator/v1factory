from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),

    # login views
    {% for v in login_views %}
    url({{ v.url }}, {{ v.view_path }}),
    {% endfor %}

    {% for v in views %}
    url({{ v.url }}, {{ v.view_path }}),
    {% endfor %}

    {% for v in form_receivers %}
    url({{ v.url }}, {{ v.view_path }}),
    {% endfor %}
)

urlpatterns += staticfiles_urlpatterns()
