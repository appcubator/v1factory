var constantContainers = {
  'login' : [
    {
      'type' : 'text-input',
      'content_attribs' : {
        placeholder : 'Username...'
      },
      'constant_attribs' : {
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
        placeholder : 'Password...'
      },
      'constant_attribs' : {
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
      'constant_attribs' : {
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
  'facebook' : [
    {
      'type' : 'button',
      'permAttribs' : {
        value : "Login w/ facebook"
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