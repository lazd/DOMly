# DOMly
> An insanely fast client-side templating language

DOMly uses `cloneNode` and `createElement` to render templates in the browser up to **7 times faster** than [doT] and [Handlebars].

DOMly is named after [Dolly the sheep][Dolly], the first mammal to be cloned.


## Example

DOMly's syntax is simply HTML with a few special elements and attribute prefixes thrown in, with Mustache-like syntax for variable substitution and method invocation.

```html
<div>
  <h1>Category: {{data.category}}</h1>
    <if data.items.length>
      <ul>
        <foreach data.items>
          <li>
            <h2>{{parent.category}}: {{data.name}}</h2>
            <h3 if-data.sale='class="sale"'>{{data.rice}}</h3>
            <h3>{{formatCount(data.stockCount)}} in stock</h3>
            <button unless-data.stockCount='disabled="disabled"'>Buy now</button>
          </li>
        </foreach>
      </ul>
    <else>
      <p>This category is empty.</p>
    </if>
</div>
```

Calling a compiled template returns the the root [Node] or [DocumentFragment], ready to be added to the DOM:

```js
var div = template({
  category: 'Main Courses',
  items: [
    {
      name: 'Spicy Steak Tacos',
      sale: true,
      price: '$5.00',
      stockCount: 100
    }
  ]
});

// Add the node to the DOM
document.body.appendChild(div);
```


## Available variables

### `data`

`data` refers to the current data context as passed to the template. If within a `<foreach>` or `<forin>` loop, `data` refers to the current item.

### `parent`

When within a `<foreach>` or `<forin>` loop, `parent` refers to the data context outside of the loop. This can be chained, resulting in `parent.parent` referring to the data context outside of two nested loops.

### `this`

`this` refers to the value of `this` when executing the template function.

The initial value of `this` when executing a template is whatever is to the left of the dot:

```
var obj = {
  template: template
};

// this is obj
obj.template();
```

You can change the value of `this` when executing template function by using [`Function.prototype.call`](Function.prototype.call) or [`Function.prototype.bind`](Function.prototype.bind):

```js
var obj = {
  method: function() {
    return 'Available as this.method()';
  },
  property: 'Available as this.property'
};

var templateData = {
  property: 'Available as this.data'
};

// Render the template with obj as this and templateData as data
var fragment = template.call(obj, data);
```


### `someGlobalVariable`

All global variables and functions are available within templates.

As properties of the data context and `this` object must be preceded by `data` and `this` respectively, there is no possibility of accidentally using a global variable.


### `someIterator`

An iterator variable, as declared when using `<foreach>` or `<forin>` with a named iterator.

Iterators supersede global variables, so you will not be able to access any globals with the same name as an iterator used anywhere in the template.

### Statements

Statements take the same form as JavaScript statements, except spaces are not allowed.

Note: Expressions are not currently supported within statements. As such, statements cannot contain `&&`, `||`, `+`, etc.


### `variable`

Variables can be used as the return value of a statement.

* `data` - Substitute the current data context directly
* `data.myProperty` - Substitute a property of the current data context
* `this.myProperty` - Substitute with a property of this
* `myGlobalVariable` - Substitute a global variable
* `myGlobalObject.myProperty` - Substitute a property of a globally accessible object


### `method()`

Methods can be invoked as part of a statement.

* `data.myMethod()` - Invoke a method of the current data context
* `parent.myMethod()` - Invoke a method of the parent data context
* `this.myMethod()` - Invoke a method on this
* `myGlobalFunction()` - Invoke a globally accessible function
* `myGlobalObject.myMethod()` - Invoke a method of a globally accessible object

Invoked methods can be passed any arbitrary arguments. For instance:

```
myMethod(data.myDataProp,parent.myParentProp,this.myScopeProp,myGlobalVariable,myGlobalObject.myProp)
```

The above statement would invoke `myMethod` with the following:

* The value of the current data context's `myDateProp` property
* The value of the parent data context's `myParentProp` property
* The value of `this`'s `myScopeProp` property
* The value of the global variable `myGlobalVariable`
* The value of the `myProp` property of the globally accessible object, `myGlobalObject`


## Substitutions

### `{{statement}}`

Substitute the return value of `statement` into the DOM as text.

Substitutions can be made in attribute values or text content:

```html
<button class="{{data.className}}">{{data.label}}</button>
```

Substitutions are always escaped. **It is impossible to inject HTML.**


## Syntax


### `<if statement>`

Include the contained elements if `statement` is truthy.

#### If the value of a data context property is truthy

In this example, we simply test the current data context's `enabled` property for truthiness, adding the `<p>` to the DOM if it's truthy.

```html
<if data.enabled>
  <p>{{data.name}} is enabled!</p>
</if>
```

#### If the return value of a method is truthy

In this example, the method `passesTest` is a method of `this`. We'll pass the current data context to it, and, if `passesTest` returns a truthy value, we'll add the `<p>` to the DOM.

```html
<if this.passesTest(data)>
  <p>{{data.name}} passes the test!</p>
</if>
```


### `<unless statement>`

The opposite of `<if statement>`.


### `<else>`

Used with `<if>` and `<unless>`, evaluated if the statement is falsey.

```html
<if data.enabled>
  <p>{{data.name}} is enabled!</p>
<else>
  <p>{{data.name}} is disabled.</p>
</if>
```


### `<foreach statement[,iterator]>`

Iterate over the items the of the array returned by `statement`. The item is available as `data`.

If `iterator` is provided, the index of the current item will be available as `{{iterator}}` for substitution and `iterator` for method invocation.

#### Data
```json
{
  "tags": ["hot", "fresh", "new"]
}
```

#### Template
```html
<ul>
  <foreach data.tags,tagNumber>
    <li>{{tagNumber}}. {{data}}</li>
  </foreach>
</ul>
```

#### Output
```html
<ul>
  <li>0. hot</li>
  <li>1. fresh</li>
  <li>2. new</li>
</ul>
```


### `<forin statement[,prop]>`

Iterate over the properties of `object`. The value is available as `data`.

If `prop` is provided, the property name will be available as `{{prop}}` for substitution and `prop` for method invocation.


#### Data
```json
{
  "stats": {
    "Spice level": "hot",
    "Vegetarian": "No",
    "Rating": "5"
  }
}
```


#### Template
```html
<ul>
  <forin data.stats,stat>
    <li>{{stat}}: {{data}}</li>
  </forin>
</ul>
```


#### Output
```html
<ul>
  <li>Spice level: Hot</li>
  <li>Vegetarian: No</li>
  <li>Rating: 5</li>
</ul>
```


### `<div if-statement='attr="value"'>`

Conditionally sets the `attr` attribute to `value` if the return value of `statement` is truthy.

Use space to separate multiple attributes.

```html
<button if-data.disabled='disabled="disabled" class="disabled"'>Buy</button>
```

Attributes can contain substitutions as well:

```html
<button if-data.customAttr='{{customAttr.name}}={{customAttr.value}}'>Buy</button>
```


### `<div unless-statement='attr="value"'>`

The opposite of `<div if-statement='attr="value"'>`.


### `<partial SomeNameSpace.someFunction(statement,statement)><partial>`

Call `SomeNameSpace.someFunction`, passing `arg1` and `arg2`. The function must return a [DocumentFragment] or [Node].

If no arguments are passed, the current data context will be passed.


### `<helper SomeNameSpace.someFunction(statement,statement)>{{statement}} and text</helper>`

Call `SomeNameSpace.someFunction`, passing the evaluated string. The function must return a string which will be inserted as text content.

Text content and statements inside of the node will be evaluated and passed as the last argument to the helper.


### `<js>`

Evaluates the content in place. `data` will be set to the current data object and can be mutated or re-assigned.

```html
<js>
var i = 10;
while (i-- > 0) {
  data.count = i;
</js>
  <span>{{data.count}}</span>
<js>
}
</js>
```


### `handle="handleName"`

If the `handle` attribute is present on any elements in the template, a reference to the element will be assigned as `this.handleName`.

Statements can also be used within handle names.

#### Template

```html
<ul handle="list">
  <foreach data.tags,itemNum>
    <li handle="item_{{itemNum}}">{{data}}</li>
  </foreach>
</ul>
```

#### Usage
```js
// An object we'll use as the value of this
var obj = {};

// Data for the template
var templateData = {
  name: 'MainList',
  tags: [
    'Tag 1',
    'Tag 2'
  ]
};

// Render the template with obj as this and templateData as data
template.call(obj, templateData);

// For handle names that start with $, references to the jQuery object are available
view.item_0.innerHTML = 'A new Tag 1';
view.item_1.innerHTML = 'A new Tag 2';
```

If a handle name begins with `$`, such as `$handle`, a jQuery object will be stored as `$handle` and the Node itself will be stored as `handle`. This is accomplished by passing the node to `$`, so you can use your own `$` function instead of jQuery.


## Template precompilation

DOMly parses HTML to generate `createElement` statements, and as such, it only makes sense if precompiled. **You cannot compile DOMly templates in the browser.**

Use [`grunt-DOMly`][grunt-DOMly] or [`gulp-DOMly`][gulp-DOMly] to precompile your templates.

Alternatively, the Node module exports a function that takes template code and options. It returns a function you can serialize and make available for client-side execution however you see fit.


### Precompilation with the `DOMly` module
```js
var DOMly = require('DOMly');
var fs = require('fs');

// Precompile returns a string
var template = DOMly.precompile('<p>My template is {{data.adjective}}!</p>', { stripWhitespace: true });

fs.writeFileSync('template.js', 'var template = '+template.toString()+';');

### Usage
```html
<script src="template.js"></script>
<script>
  document.body.appendChild(template({ adjective: 'awesome' }));
</script>
```

## Compiler options

The compiler takes the following options:

#### stripWhitespace
Type: `Boolean`  
Default: `false`

If `true`, meaningless whitespace will be stripped. This provides a large performance boost as less meaningless `createTextNode` calls are created.

**Warning:** Meaningful whitespace, such as space between inline tags, will be preserved. However, if your CSS gives `display: inline` to block elements, whitespace between those elements will still be stripped.

#### debug
Type: `Boolean`  
Default: `false`

Dump debug data, including the source file, parsed tree, and compiled function body.


## Running the benchmarks

DOMly comes with a set of benchmarks that use karma-benchmark to test real-world browser performance.

```
npm install
grunt bench
```


## Running the test suite

DOMly is tested with mocha, chai, and jsdom.

```
npm install
grunt test
```


## License

DOMly is licensed MIT.


[Node]: https://developer.mozilla.org/en-US/docs/Web/API/Node
[DocumentFragment]: https://developer.mozilla.org/en-US/docs/Web/API/DocumentFragment
[Function.prototype.call]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
[Function.prototype.bind]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
[grunt-DOMly]: http://github.com/lazd/grunt-DOMly
[gulp-DOMly]: http://github.com/lazd/gulp-DOMly
[doT]: http://olado.github.io/doT/index.html
[Handlebars]: http://handlebarsjs.com/

[Dolly]: http://en.wikipedia.org/wiki/Dolly_(sheep)
