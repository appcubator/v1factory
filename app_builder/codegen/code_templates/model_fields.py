{{ f.identifier() }} = models.{{ f.django_type() }}Field({% for a in f.args() %}{{ a }}, {% endfor %}{% for k,v in f.kwargs().items() %}{{ k }}={{ v }}, {% endfor %})
