from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import authenticate, login
from django import forms

class MyUserCreationForm(UserCreationForm):
  """Creates a user"""
  #username
  #password
  name = forms.CharField(max_length=200, required=True)
  email = forms.EmailField(required=True)

  def save(self, commit=True):
    user = super(MyUserCreationForm, self).save(commit=False)
    name = self.cleaned_data.get('name')
    email = self.cleaned_data.get('email')

    name_tokens = name.split(" ")
    if len(name_tokens) == 0:
      user.first_name = name
    else:
      user.first_name = name_tokens[0]
      user.last_name = " ".join(name_tokens[1:])

    user.email = email

    if commit:
      user.save()

    return user

@require_POST
def {{ form_receiver.identifier() }}(request):
  """Create a User object"""
  form = MyUserCreationForm(request.POST)
  if form.is_valid():
    user = form.save()
    new_user = authenticate(username=request.POST['username'],
                            password=request.POST['password1'])
    login(request, new_user)
    return redirect('/')
  else:
    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")
