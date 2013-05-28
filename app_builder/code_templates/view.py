def {{ view.identifier }}(request{% for name, entity in view.page_context %}, {{ name }}{% endfor %}):
    pass{#







@require_GET
def {{ identifier }}(request{% for u in page_context %}, {{ u.arg_name }}{% endfor %}):
  page_context = {}
  {% for ud in url_data %}
  page_context['{{ ud. }}'] = get_object_or_404({{ m.identifier() }}, pk={{ m.foreign_key_name() }})
  {% endfor %}
{% for q in view.queries.each() %}
  page_context['{{ q.identifier() }}'] = {{ q.render() }}
{% endfor %}

  return render(request, {{ view.template_repr() }}, page_context)

#}
