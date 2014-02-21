/* description: Parse invocations and property references */
%{

var util = require('util');

function inspect(obj) {
  console.log(util.inspect(obj, false, null));
}

%}


/* lexical grammar */
%lex
%%

[\w\d_$]+\b   return 'VAR'
"("           return '('
")"           return ')'
"."           return '.'
","           return ','
";"           return ';'
\s+           /* skip whitespace */
<<EOF>>       return 'EOF'
.             return 'INVALID'

/lex

%start statement

%%

/* language grammar */

statement
  : invocation EOF -> $invocation; return $invocation
  | path EOF -> $path; return $path
  ;

invocation
  : path '(' args ')' -> { type: 'invocation', path: $path, args: $args }
  ;

args
  : path -> $$ = [$1]
  | invocation -> $$ = [$1]
  | args ',' path -> $1.push($3); $$ = $1
  |
  ;

path
  : VAR -> $$ = { type: 'path', path: [$1] }
  | path '.' VAR -> $1.path.push($3); $$ = $1
  ;
