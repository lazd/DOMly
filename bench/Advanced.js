suite('Advanced', function() {

  var experienceMap = [
    'Beginner',
    'Novice',
    'Experienced',
    'Talented',
    'Expert'
  ];

  var helpers = {
    toTitleCase: function(str) {
      return str.replace(/\w\S*/g, function(str) {
        return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase();
      });
    },
    formatLevel: function(number) {
      return experienceMap[number];
    },
    formatYears: function(number) {
      return number + ' year' + (number === 1 ? '' : 's');
    }
  };

  for (var helper in helpers) {
    Handlebars.registerHelper(helper, helpers[helper]);
  }

  _.extend(templates, helpers);
  _.extend(dot_templates, helpers);
  _.extend(lodash_templates, helpers);

  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.lastChild) {
      result.removeChild(result.lastChild);
    }
    result.appendChild(templates.Advanced(this.data));
  });

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.Advanced(this.data);
  });

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.Advanced(this.data);
  });

  benchmark('lodash', function() {
    var result = document.getElementById('result');
    result.innerHTML = lodash_templates.Advanced(this.data);
  });
}, setup({
  name: 'Code Monkey',
  location: 'San Francisco',
  industry: 'Computer Software',
  email: 'codemonkey0xCOFFEE@gmail.com',
  title: 'Banana scientist',
  skills: [
    {
      name: 'Tree Structures',
      level: 4,
      years: 27
    },
    {
      name: 'Code Slinging',
      level: 2,
      years: 10
    },
    {
      name: 'Swinging from ASTs',
      level: 3,
      years: 24
    },
    {
      name: 'Caffeine Arts',
      level: 3,
      years: 12
    }
  ]
}));
