@require_GET
def {{ v.identifier() }}(request{% for m in v.url.model_refs() %}, {{ m.foreign_key_name() }}{% endfor %}):
  page_context = {}{#
#}{% for m in v.url.model_refs() %}
  page_context['{{ m.identifier().lower() }}'] = get_object_or_404({{ m.identifier() }}, pk={{ m.foreign_key_name() }}){#
#}{% endfor %}{#
#}{% for q in v.queries.each() %}
  page_context['{{ q.identifier() }}'] = {{ q.render() }}{#
#}{% endfor %}
  return render(request, {{ v.template_repr() }}, page_context)
