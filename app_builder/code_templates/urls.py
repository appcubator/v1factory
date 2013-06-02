from django.conf.urls import patterns, include, url


urlpatterns = patterns('{{ urls.module }}',
    {% for url_string, function in urls.routes %}
    url({{ url_string }}, '{{ function.identifier }}'),
    {% endfor %}
)
