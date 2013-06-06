
{% set JsonResponse = imports['django.JsonResponse'] %}
{% set simplejson = imports['django.simplejson'] %}
{% set request = locals['request'] %}

@require_POST
def {{ fr.identifier }}({{request}}):
    form = {{ fr.form_id }}({{request}}.POST)
    if form.is_valid():
        # do some stuff
        obj = form.save()
        return {{JsonResponse}}(data={})

    return {{JsonResponse}}(errors=form.errors)

