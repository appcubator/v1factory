from django.contrib.auth.forms import UserCreationForm
from webapp.models import UserProfile
from django.contrib.auth import authenticate, login
from django import forms


class UserCreationForm(forms.ModelForm):
    """
    A form that creates a user, with no privileges, from the given username and
    password. Copied and modified from the django source code.
    """
    error_messages = {
        'duplicate_username': _("A user with that username already exists."),
        'password_mismatch': _("The two password fields didn't match."),
    }
    username = forms.RegexField(label=_("Username"), max_length=30,
        regex=r'^[\w.@+-]+$',
        help_text=_("Required. 30 characters or fewer. Letters, digits and "
                      "@/./+/-/_ only."),
        error_messages={
            'invalid': _("This value may contain only letters, numbers and "
                         "@/./+/-/_ characters.")})
    password1 = forms.CharField(label=_("Password"),
        widget=forms.PasswordInput)
    password2 = forms.CharField(label=_("Password confirmation"),
        widget=forms.PasswordInput,
        help_text=_("Enter the same password as above, for verification."))

    class Meta:
        model = User
        fields = ("username",)

    def clean_username(self):
        # Since User.username is unique, this check is redundant,
        # but it sets a nicer error message than the ORM. See #13147.
        username = self.cleaned_data["username"]
        try:
            User._default_manager.get(username=username)
        except User.DoesNotExist:
            return username
        raise forms.ValidationError(self.error_messages['duplicate_username'])

    def clean_password2(self):
        password1 = self.cleaned_data.get("password1")
        password2 = self.cleaned_data.get("password2")
        if password1 and password2 and password1 != password2:
            raise forms.ValidationError(
                self.error_messages['password_mismatch'])
        return password2

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data["password1"])
        if commit:
            user.save()
        return user

class UserProfileCreationForm(forms.ModelForm):

  class Meta:
    model = UserProfile
    fields = ( 'list of fields included, comma separated', )

  def save(self, user, commit=True, *args, **kwargs):
    userprofile = super(UserProfileCreationForm, self).save(commit=False, *args, **kwargs)
    userprofile.{{ name of the user field in userprofile }} = user
    if commit:
      userprofile.save()
    return userprofile

@require_POST
def {{ form_receiver.identifier() }}(request):
  """Create a User object"""
  form = UserCreationForm(request.POST)
  upform = UserProfileCreationForm(request.POST)
  if form.is_valid() and upform.is_valid():
    user = form.save()
    new_user = authenticate(username=request.POST['username'],
                            password=request.POST['password1'])
    upform.save(new_user)
    login(request, new_user)
    return redirect('/')
  else:
    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")
