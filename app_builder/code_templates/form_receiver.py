
{% set JsonResponse = imports['django.JsonResponse'] %}
{% set simplejson = imports['django.simplejson'] %}
{% set request = locals['request'] %}

@require_POST
def {{ fr.identifier }}({{request}}{% block args %}{% endblock %}):
    {% block init_forms %}
    form = {{ fr.form_id }}({{request}}.POST)
    {% endblock %}
    if form.is_valid():
        {% block do_stuff_with_valid_form %}
        obj = form.save()
        return {{JsonResponse}}(data={})
        {% endblock %}

    return {{JsonResponse}}(errors=form.errors)

