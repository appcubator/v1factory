{#{% set patterns = imports['django.patterns'] %}
{% set url = imports['django.url'] %}
{% set urlpatterns = locals['urlpatterns'] %}#}
{% set patterns = 'PATTERNS' %}
{% set url = 'URL' %}
{% set urlpatterns = 'urlpatterns' %}

{{urlpatterns}} {% if not urls.first_time %}{{ '+' }}{% endif %}= {{patterns}}('{{ urls.module }}',
    {% for url_string, function in urls.routes %}
    {{url}}({{ url_string }}, '{{ function.identifier }}'),
    {% endfor %}
)
