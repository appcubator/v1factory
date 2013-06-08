
{% set JsonResponse = imports['django.JsonResponse'] %}
{% set simplejson = imports['django.simplejson'] %}
{% set get_object_or_404 = imports['django.get_object_or_404'] %}

{% set request = locals['request'] %}
{% set obj = locals['obj'] %}

{% block args%}{% for arg, data in fr.args %}, {{ arg }}{% endfor %}{% endblock %}


{% block init_forms %}
{% for arg, arg_data in fr.args %}
{{ arg_data.inst_id }} = {{get_object_or_404}}({{ arg_data.model_id }}, pk={{ arg }})
{% endfor %}
form = {{ fr.form_id }}({{request}}.POST)
{% endblock %}

{% block do_stuff_with_valid_form %}
{{obj}} = form.save(commit=False)
{% for l,r in fr.relation_assignments %}
{{ l() }} = {{ r() }}
{% endfor %}
{% for l in fr.before_save_saves %}
{{ l() }}.save()
{% endfor %}
{{obj}}.save()
{% for l in fr.after_save_saves %}
{{ l() }}.save()
{% endfor %}
# TODO will also have to save the l's that changed.
# TODO: redirect or refresh page.
return {{JsonResponse}}(data={})
{% endblock %}

