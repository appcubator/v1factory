from django.conf.urls import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    url(r'^admin/', include(admin.site.urls)),

    {% for v in urls %}
    url({{ v.url_repr() }}, {{ v.view_path_repr() }}),
    {% endfor %}

    url(r'', include('social_auth.urls')),
)

urlpatterns += staticfiles_urlpatterns()
