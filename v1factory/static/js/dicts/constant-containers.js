var constantContainers = {
  'facebook' : {
    name: "facebook",
    action: "signup",
    entity: "User",
    fields: [
                    {
                        "name": "Submit",
                        "placeholder": "Login",
                        "label": "Login",
                        "displayType": "button",
                        "type": "button",
                        "options": []
                    }
    ]
  },
  'twitter' : {
    name: "twitter",
    action: "signup",
    entity: "User",
    fields : [
      {
                        "name": "Submit",
                        "placeholder": "Login",
                        "label": "Login",
                        "displayType": "button",
                        "type": "button",
                        "options": []
      }
    ]
  },
  'linkedin' : {
    name: "linkedin",
    action: "signup",
    entity: "User",
    fields : [
      {
                        "name": "Submit",
                        "placeholder": "Login",
                        "label": "Login",
                        "displayType": "button",
                        "type": "button",
                        "options": []
      }
    ]
  },
  'Local Login': {
    name: "local login",
    action: "login",
    entity: "User",
    fields : [
                    {
                        "name": "username",
                        "placeholder": "Username",
                        "label": "Username",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": []
                    },
                    {
                        "name": "password",
                        "placeholder": "Password",
                        "label": "Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "name": "Submit",
                        "placeholder": "Login",
                        "label": "Login",
                        "displayType": "button",
                        "type": "button",
                        "options": []
                    }
    ]
  },
  'Sign Up' : {
    "action": "signup",
    "fields": [
                    {
                        "name": "username",
                        "placeholder": "Username",
                        "label": "Username",
                        "displayType": "single-line-text",
                        "type": "text",
                        "options": []
                    },
                    {
                        "name": "password1",
                        "placeholder": "Password",
                        "label": "Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "name": "password2",
                        "placeholder": "Confirm Password",
                        "label": "Confirm Password",
                        "displayType": "password-text",
                        "type": "password",
                        "options": []
                    },
                    {
                        "name": "email",
                        "placeholder": "Email Address",
                        "label": "Email Address",
                        "displayType": "email-text",
                        "type": "email",
                        "options": []
                    },
                    {
                        "name": "Sign Up",
                        "placeholder": "",
                        "label": "Sign Up!",
                        "displayType": "button",
                        "type": "button",
                        "options": []
                    }
              ],
    "goto": "internal://Homepage",
    "name": "Sign Up"
  }
};
