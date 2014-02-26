suite('Loops', function() {
  benchmark('DOMly', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(templates.TagList(this.data));
  });

  /*
  window.htmlbars_templates = {
    TagList: HTMLBars.compile(__html__['bench/fixtures/hbs/TagList.hbs'])
  };

  benchmark('HTMLBars', function() {
    var result = document.getElementById('result');
    while (result.firstChild) {
      result.removeChild(result.firstChild);
    }

    result.appendChild(htmlbars_templates.TagList(this.data, { helpers: HTMLBars.helpers }));
  });
  */

  benchmark('Handlebars', function() {
    var result = document.getElementById('result');
    result.innerHTML = hbs_templates.TagList(this.data);
  });

  benchmark('doT', function() {
    var result = document.getElementById('result');
    result.innerHTML = dot_templates.TagList(this.data);
  });

  benchmark('lodash', function() {
    var result = document.getElementById('result');
    result.innerHTML = lodash_templates.TagList(this.data);
  });
}, setup({
  name: 'Category',
  tags: [
    'Tag 1',
    'Tag 2',
    'Tag 3',
    'Tag 4',
    'Tag 5',
  ]
}));
