var constantContainers = {
  'login' : [
    {
      'type' : 'text-input',
      'content_attribs' : {
        placeholder : 'Username'
      },
      'cons_attribs' : {
        name : 'username'
      },
      'layout' : {
        top   : 0,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'password',
      'content_attribs' : {
        placeholder : 'Password'
      },
      'cons_attribs' : {
        name : 'password',
        type : 'password'
      },
      'layout' : {
        top   : 8,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'button',
      'content_attribs' : {
        value : 'Log In'
      },
      'cons_attribs' : {
        type : 'submit'
      },
      'layout' : {
        top   : 12,
        left  : 0,
        width : 16,
        height: 4
      }
    }
  ],
  'signup' : [
    {
      'type' : 'text-input',
      'content_attribs' : {
        placeholder : 'Username'
      },
      'cons_attribs' : {
        name : 'username',
        type : 'text'
      },
      'layout' : {
        top   : 0,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'password',
      'content_attribs' : {
        placeholder : 'Password'
      },
      'cons_attribs' : {
        name : 'password1',
        type : 'password'
      },
      'layout' : {
        top   : 8,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'password',
      'content_attribs' : {
        placeholder : 'Confirm password'
      },
      'cons_attribs' : {
        name : 'password2',
        type : 'password'
      },
      'layout' : {
        top   : 12,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'text-input',
      'content_attribs' : {
        placeholder : 'Email'
      },
      'cons_attribs' : {
        name : 'email',
        type : 'text'
      },
      'layout' : {
        top   : 16,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'text-input',
      'content_attribs' : {
        placeholder : 'Display Name'
      },
      'cons_attribs' : {
        name : 'name',
        type : 'text'
      },
      'layout' : {
        top   : 20,
        left  : 0,
        width : 16,
        height: 4
      }
    },
    {
      'type' : 'button',
      'content_attribs' : {
        value : 'Log In'
      },
      'cons_attribs' : {
        type : 'submit'
      },
      'layout' : {
        top   : 24,
        left  : 0,
        width : 16,
        height: 4
      }
    }
  ],
  'facebook' : [
    {
      'type' : 'button',
      'cons_attribs' : {
        type : 'submit'
      },
      'content_attribs' : {
        value : "Login w/ facebook"
      },
      'layout' : {
        top   : 0,
        left  : 0,
        width : 16,
        height: 4
      }
    }
  ],
  'twitter' : [
    {
      'type' : 'button',
      'cons_attribs' : {
        type : 'submit'
      },
      'content_attribs' : {
        value : "Login w/ Twitter"
      },
      'layout' : {
        top   : 0,
        left  : 0,
        width : 16,
        height: 4
      }
    }
  ],
  'linkedin' : [
    {
      'type' : 'button',
      'cons_attribs' : {
        type : 'submit'
      },
      'content_attribs' : {
        value : "Login w/ LinkedIn"
      },
      'layout' : {
        top   : 0,
        left  : 0,
        width : 16,
        height: 4
      }
    }
  ]
};
